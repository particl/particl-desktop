import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { ModalsHelperService } from 'app/modals/modals.module';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';
import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { ImageItem } from '@ngx-gallery/core';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { take, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-preview-listing',
  templateUrl: './preview-listing.component.html',
  styleUrls: ['./preview-listing.component.scss']
})

export class PreviewListingComponent implements OnInit, OnDestroy {

  private destroyed: boolean = false;
  private processModal: any;
  public pictures: Array<any> = new Array();
  public price: any;
  public date: string;
  public profileAddress: string = '';
  // private currencyprice: number = 0;
  images: ImageItem[] = [];

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['details', 'shipping', 'comments'];

  constructor(
    private dialogRef: MatDialogRef<PreviewListingComponent>,
    private dialog: MatDialog,
    private modals: ModalsHelperService,
    private proposalsService: ProposalsService,
    private snackbarService: SnackbarService,
    private profileService: ProfileService,
    public countryListService: CountryListService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    // this.marketState.observe('currencyprice')
    //   .takeWhile(() => !this.destroyed)
    //   .subscribe(price => {
    //     this.currencyprice = price[0].price;
    //   });
    this.getVoteOfListing();
    if (this.data.listing) {
      this.images = this.data.listing.imageCollection.imageUrls;
    }
  }

  getVoteOfListing(): void {
    if (this.data && this.data.listing && this.data.listing.proposalHash) {
      this.proposalsService.get(this.data.listing.proposalHash)
        .pipe(take(1))
        .subscribe((vote: any) => {
          this.data.listing.VoteDetails = vote;
        }, (err: any) => {
          if (this.data.listing.submitterAddress) {
            this.profileService.default().pipe(take(1)).subscribe(
              (profile: any) => {
                const profileAddress: string = (profile.object || {}).address || '';
                if (profileAddress && (profileAddress === this.data.listing.submitterAddress)) {
                  this.data.listing.VoteDetails = new VoteDetails({
                    ProposalOption: new VoteOption({
                      description: 'REMOVE'
                    }),
                    voter: this.data.listing.submitterAddress
                  });
                }
              });
          }
          // Handle unknown user vote here (log it perhaps, or do nothing)
        })
    }
  }

  voteForListing(option: VoteOption): void {
    this.modals.unlock({ timeout: 30 }, (status) => this.postVote(option));
  }

  postVote(option: VoteOption): void {
    this.openProcessingModal();
    const params = [
      this.data.listing.proposalHash,
      option.optionId
    ];
    this.proposalsService.vote(params).subscribe((response) => {
      this.processModal.close();
      this.snackbarService.open(`Successfully voted for ${this.data.listing.title}`, 'info');
      this.data.listing.VoteDetails = new VoteDetails({
        ProposalOption: option
      })
    }, (error) => {
      this.processModal.close();
      this.snackbarService.open(error);
    })
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  openProcessingModal() {
    this.processModal = this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Hang on, we are busy processing your vote'
      }
    });
  }

}
