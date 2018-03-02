import { ChaoscraftWwwPage } from './app.po';

describe('chaoscraft-www App', () => {
  let page: ChaoscraftWwwPage;

  beforeEach(() => {
    page = new ChaoscraftWwwPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
