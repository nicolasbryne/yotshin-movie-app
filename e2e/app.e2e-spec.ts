import { MoviePortalPage } from './app.po';

describe('movie-portal App', () => {
  let page: MoviePortalPage;

  beforeEach(() => {
    page = new MoviePortalPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
