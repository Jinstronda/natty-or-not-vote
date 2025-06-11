import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://nattyorjuicy.com', { waitUntil: 'networkidle2' });

    // Extract main navigation links
    const navLinks = await page.$$eval('nav a', links =>
      links.map(link => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }))
    );

    // Extract visible buttons and their text
    const buttons = await page.$$eval('button', btns =>
      btns.map(btn => btn.textContent?.trim())
    );

    // Extract main headings
    const headings = await page.$$eval('h1, h2, h3', hs =>
      hs.map(h => ({ tag: h.tagName, text: h.textContent?.trim() }))
    );

    // Extract any dynamic content (e.g., cards, images with alt text)
    const cards = await page.$$eval('[class*=card], .card, .vote, .profile', els =>
      els.map(el => el.textContent?.trim())
    );
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({ src: img.src, alt: img.alt }))
    );

    // Log summary
    console.log('--- Website Overview: nattyorjuicy.com ---');
    console.log('Navigation Links:', navLinks);
    console.log('Buttons:', buttons);
    console.log('Headings:', headings);
    console.log('Cards/Profiles:', cards.slice(0, 5)); // show a sample
    console.log('Images:', images.slice(0, 5)); // show a sample

    await browser.close();
    process.stdout.write('Script completed successfully.\n');
  } catch (error) {
    console.error('Error during Puppeteer script execution:', error);
    process.exit(1);
  }
})(); 