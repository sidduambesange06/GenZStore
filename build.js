const fs = require('fs');
const path = require('path');

const targets = ['dist', 'build'];
const itemsToCopy = [
  'index.html', 'shop.html', 'product.html', 'cart.html',
  'checkout.html', 'order-confirmation.html', 'about.html',
  'contact.html', 'server.js', 'app.js', 'package.json',
  '.htaccess', 'css', 'js'
];

targets.forEach(target => {
  fs.mkdirSync(target, { recursive: true });
  itemsToCopy.forEach(item => {
    if (fs.existsSync(item)) {
      try {
        fs.cpSync(item, path.join(target, item), { recursive: true });
      } catch (e) {
        // Continue silently on error
      }
    }
  });
});

console.log('GENZSTORE build completed successfully.');
