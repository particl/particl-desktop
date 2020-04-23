import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { environment } from '../../../../environments/environment';

import { NotificationService } from 'app/core/notification/notification.service';

import * as socketIo from 'socket.io-client';
import { ListingService } from '../api/listing/listing.service';
import { take } from 'rxjs/operators';
import { CommentService } from '../api/comment/comment.service';
import { ProfileService } from '../api/profile/profile.service';
import { Subscription, Observable } from 'rxjs';
import { SettingsStateService } from 'app/settings/settings-state.service';

@Injectable()
export class MarketNotificationService {
    log: any = Log.create('market-notification.service id:' + Math.floor((Math.random() * 1000) + 1));

    private socket: SocketIOClient.Socket;
    private _notificationData: any;
    private _cleanup: any;
    private events$: Subscription[] = [];

    private get notificationData() {
        if (!this._notificationData) {
            this._notificationData = JSON.parse(localStorage.getItem('NOTIFICATION_DATA')) || {};
        }
        return this._notificationData;
    }

    private set notificationData(data: any) {
        this._notificationData = data;
        localStorage.setItem('NOTIFICATION_DATA', JSON.stringify(data));
    }

    constructor(
        private notificationService: NotificationService,
        private listingService: ListingService,
        private commentService: CommentService,
        private profileService: ProfileService,
        private _settings: SettingsStateService
    ) {}

    public async start(): Promise<void> {
        this.stop();

        const mpPort = this._settings.get('settings.market.env.port');
        this.socket = socketIo(`http://${environment.marketHost}:${mpPort ? mpPort : environment.marketPort}/`);

        this.events$ = [];
        this.events$.push(this.onEvent('connect').subscribe(() => this.log.d('SocketIO connected to market place!')));
        this.events$.push(this.onEvent('NEW_COMMENT').subscribe((payload) => this._handleCommentNotification(payload)));
        this.startCleanup();
    }

    public onEvent(event: string): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on(event, (data) => {
                try {
                    observer.next(JSON.parse(data));
                } catch (e) {
                    observer.next(data);
                }
            });
        });
    }

    public stop() {
        if (this._cleanup !== undefined) {
          clearInterval(this._cleanup);
        }
        for (const event$ of this.events$) {
            event$.unsubscribe();
        }

        if (this.socket !== undefined) {
            this.socket.removeAllListeners();
            this.socket.close();
            this.socket = undefined;
        }
    }

    private async _handleCommentNotification(comment: any) {
        if (comment && comment.type === 'LISTINGITEM_QUESTION_AND_ANSWERS') {
            this.listingService.get(comment.target).pipe(take(1)).subscribe(listing => {

                // If its my listing
                if (listing.isMine) {
                    // If there is no parent send a notification as it is a new question
                    if (!comment.hasOwnProperty('parent')) {
                        this.notificationService.sendNotification('New Question', `Check listing "${listing.title.substring(0, 15)}..." for new question.`);
                        this.flagTargetUnread(comment.type, listing.hash, comment.hash);
                    } else {
                        // Update info for display badges, this will highlight replies to questions on your own listing item
                        // Dont think we need an explict notification for that
                        this.flagTargetUnread(comment.type, listing.hash, comment.parent.hash);
                    }
                }

                // Is the a reply to one of my questions
                if (comment.hasOwnProperty('parent')) {
                    this.profileService.default().pipe(take(1))
                    .subscribe((profile: any) => {
                        this.commentService.get(comment.parent.hash).pipe(take(1))
                        .subscribe((parentComment) => {
                            if (parentComment.sender === profile.address) {
                                this.notificationService.sendNotification('New Reply', `Check listing "${listing.title.substring(0, 15)}..." for new reply to your question "${parentComment.message.substring(0, 15)}...".`);
                                this.flagTargetUnread(comment.type, listing.hash, comment.parent.hash);
                            }
                        });
                    });
                }
            });
        }
    }

    public targetHasUnread(notificationType: string, targetHash: string): boolean {
        const unread = this.getTargetUnread(notificationType, targetHash);
        return unread.length > 0;
    }

    public getTargetUnread(notificationType: string, targetHash: string): any[] {
        const notificationTypeData = this.notificationData[notificationType];
        if (!notificationTypeData) {
            return [];
        }

        const target = notificationTypeData[targetHash];
        if (!target) {
            return [];
        }

        return target;
    }

    public clearTargetUnread(notificationType: string, targetHash: string) {
        const tempData = this.notificationData;
        const notificationTypeData = tempData[notificationType];
        if (!notificationTypeData) {
            return;
        }

        const target = notificationTypeData[targetHash];
        if (!target) {
            return;
        }

        delete notificationTypeData[targetHash];
        this.notificationData = tempData;
    }

    private flagTargetUnread(notificationType: string, targetHash: string, commentHash: string) {
        const tempData = this.notificationData;
        let notificationTypeData = tempData[notificationType];
        if (!notificationTypeData) {
            notificationTypeData = {};
        }

        if (!notificationTypeData[targetHash]) {
          notificationTypeData[targetHash] = [];
        }
        const target = notificationTypeData[targetHash];

        if (target.indexOf(commentHash) === -1) {
            target.push(commentHash);
        }

        this.notificationData = tempData;
    }

    private startCleanup() {
        // Try cleanup unread notifications for stale targets
        this._cleanup = setInterval(() => {
            const tempData = this.notificationData;
            for (const type of Object.keys(tempData)) {
                if (type === 'LISTINGITEM_QUESTION_AND_ANSWERS') {
                    for (const target of Object.keys(tempData[type])) {
                        this.listingService.get(target).pipe(take(1)).subscribe((listing) => {
                            if (!listing || listing.status === 'expired') {
                                delete tempData[type][target];
                                this.notificationData = tempData;
                            }
                        },
                        () => {
                            delete tempData[type][target];
                            this.notificationData = tempData;
                        });
                    }
                }
            }
        }, 300000);
    }
}
