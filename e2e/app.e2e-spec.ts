import { PartguiPage } from './app.po';

describe('partgui App', () => {
  let page: PartguiPage;

  beforeEach(() => {
    page = new PartguiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
