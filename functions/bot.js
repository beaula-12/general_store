exports.handler = async (event, context) => {
    const TelegramBot = require('node-telegram-bot-api');
    const TOKEN = '6105185297:AAG5sCebV_yK04EMmvfQ2fczOACM-FAaRX4';
    const bot = new TelegramBot(TOKEN, { polling: true });
    // array to store the inventory items
let inventory = [
    { id: 1, name: 'Item 1', price: 10, quantity: 5 },
    { id: 2, name: 'Item 2', price: 20, quantity: 3 },
    { id: 3, name: 'Item 3', price: 15, quantity: 7 },
    // add more items here
  ];
  
  // dictionary to store the user's shopping cart
  let cart = {};
  
  // command to display the inventory
  bot.onText(/\/inventory/, (msg) => {
    let chatId = msg.chat.id;
    let message = 'Here is our current inventory:\n\n';
    inventory.forEach(item => {
      message += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\n\n`;
    });
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  });
  
  // command to add an item to the shopping cart
  bot.onText(/\/order (.+)/, (msg, match) => {
    let chatId = msg.chat.id;
    let itemId = parseInt(match[1]);
    let item = inventory.find(item => item.id === itemId);
    if (item) {
      if (item.quantity > 0) {
        if (cart[itemId]) {
          cart[itemId].quantity++;
        } else {
          cart[itemId] = {
            name: item.name,
            price: item.price,
            quantity: 1
          };
        }
        item.quantity--;
        bot.sendMessage(chatId, `Added *${item.name}* to your cart.`, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `Sorry, *${item.name}* is out of stock.`, { parse_mode: 'Markdown' });
      }
    } else {
      bot.sendMessage(chatId, `Invalid item ID. Please try again.`, { parse_mode: 'Markdown' });
    }
  });
  
  // command to display the shopping cart
  bot.onText(/\/cart/, (msg) => {
    let chatId = msg.chat.id;
    let message = 'Here is your current shopping cart:\n\n';
    let total = 0;
    for (let itemId in cart) {
      let item = cart[itemId];
      let subtotal = item.price * item.quantity;
      message += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\nSubtotal: ${subtotal}\n\n`;
      total += subtotal;
    }
    message += `Total: ${total}`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  });
  
  // command to confirm the order
  bot.onText(/\/confirm/, (msg) => {
      let chatId = msg.chat.id;
      
      // check if the user chat ID is still valid
      bot.getChat(chatId).then((chat) => {
          let message = 'Your order has been confirmed:\n\n';
          let total = 0;
          for (let itemId in cart) {
              let item = cart[itemId];
              let subtotal = item.price * item.quantity;
              message += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\nSubtotal: ${subtotal}\n\n`;
              total += subtotal;
          }
          message += `Total: ${total}`;
          bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  
          // send a message to the store owner
          let ownerChatId = ' 5628012162'; // replace with the actual chat ID of the store owner
          let ownerMessage = `New order received from ${msg.from.first_name}:\n\n`;
          for (let itemId in cart) {
              let item = cart[itemId];
              ownerMessage += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\n\n`;
          }
          ownerMessage += `Total: ${total}\n\n`;
          ownerMessage += `To accept the order, type /accept ${chatId}\nTo decline the order, type /decline ${chatId}`;
          bot.sendMessage(ownerChatId, ownerMessage, { parse_mode: 'Markdown' });
  
          // store the user's chat ID in a variable for use in the /accept and /decline commands
          bot.userChatId = chatId;
      }).catch((error) => {
          // handle the "chat not found" error
          let ownerChatId = ' 5628012162'; // replace with the actual chat ID of the store owner
          let ownerMessage = `Error: ${error.message}\n\n`;
          ownerMessage += `The order from ${msg.from.first_name} could not be confirmed because the user's chat ID is invalid.`;
          bot.sendMessage(ownerChatId, ownerMessage);
          
          // clear the user's cart
          for (let itemId in cart) {
              let item = cart[itemId];
              let inventoryItem = inventory.find(item => item.id === parseInt(itemId));
              inventoryItem.quantity += item.quantity;
          }
          cart = {};
      });
  });
  
  // command to accept the order
  bot.onText(/\/accept (.+)/, (msg, match) => {
      let ownerChatId = msg.chat.id;
      let userChatId = match[1];
      if (bot.userChatId === userChatId) {
          let message = 'Your order has been accepted. Thank you for shopping with us!';
          bot.sendMessage(userChatId, message);
      } else {
          let message = 'Error: Invalid user chat ID.';
          bot.sendMessage(ownerChatId, message);
      }
      
      // clear the user's cart
      for (let itemId in cart) {
          let item = cart[itemId];
          let inventoryItem = inventory.find(item => item.id === parseInt(itemId));
          inventoryItem.quantity -= item.quantity;
      }
      cart = {};
  });
  
  // command to decline the order
  bot.onText(/\/decline (.+)/, (msg, match) => {
      let chatId = match[1];
      if (bot.userChatId === chatId) {
          let message = 'Your order has been declined by the store owner.';
          bot.sendMessage(chatId, message);
          
          // clear the user's cart
          for (let itemId in cart) {
              let item = cart[itemId];
              let inventoryItem = inventory.find(item => item.id === parseInt(itemId));
              inventoryItem.quantity += item.quantity;
          }
          cart = {};
      }
  });
  
  
  
  
  
  
  // // command to confirm the order
  // bot.onText(/\/confirm/, (msg) => {
  //     let chatId = msg.chat.id;
      
  //     // check if the user chat ID is still valid
  //     bot.getChat(chatId).then((chat) => {
  //         let message = 'Your order has been confirmed:\n\n';
  //         let total = 0;
  //         for (let itemId in cart) {
  //             let item = cart[itemId];
  //             let subtotal = item.price * item.quantity;
  //             message += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\nSubtotal: ${subtotal}\n\n`;
  //             total += subtotal;
  //         }
  //         message += `Total: ${total}`;
  //         bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  
  //         // send a message to the store owner
  //         let ownerChatId = '6173426103:AAHMlY1TDCrvVFP-C-sTEWtPkqHlfWNn5pk'; // replace with the actual chat ID of the store owner
  //         let ownerMessage = `New order received from ${msg.from.first_name}:\n\n`;
  //         for (let itemId in cart) {
  //             let item = cart[itemId];
  //             ownerMessage += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\n\n`;
  //         }
  //         ownerMessage += `Total: ${total}\n\n`;
  //         ownerMessage += `To accept the order, type /accept ${chatId}\nTo decline the order, type /decline ${chatId}`;
  //         bot.sendMessage(ownerChatId, ownerMessage, { parse_mode: 'Markdown' });
  
  //         // store the user's chat ID in a variable for use in the /accept and /decline commands
  //         bot.userChatId = chatId;
  //     }).catch((error) => {
  //         // handle the "chat not found" error
  //         let ownerChatId = '6173426103:AAHMlY1TDCrvVFP-C-sTEWtPkqHlfWNn5pk'; // replace with the actual chat ID of the store owner
  //         let ownerMessage = `Error: ${error.message}\n\n`;
  //         ownerMessage += `The order from ${msg.from.first_name} could not be confirmed because the user's chat ID is invalid.`;
  //         bot.sendMessage(ownerChatId, ownerMessage);
          
  //         // clear the user's cart
  //         for (let itemId in cart) {
  //             let item = cart[itemId];
  //             let inventoryItem = inventory.find(item => item.id === parseInt(itemId));
  //             inventoryItem.quantity += item.quantity;
  //         }
  //         cart = {};
  //     });
  // });
  
  
  
  
  
  
  
  // // command to confirm the order
  // bot.onText(/\/confirm/, (msg) => {
  //     let chatId = msg.chat.id;
  //     let message = 'Your order has been confirmed:\n\n';
  //     let total = 0;
  //     for (let itemId in cart) {
  //         let item = cart[itemId];
  //         let subtotal = item.price * item.quantity;
  //         message += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\nSubtotal: ${subtotal}\n\n`;
  //         total += subtotal;
  //     }
  //     message += `Total: ${total}`;
  //     bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  
  //     // send a message to the store owner
  //     let ownerChatId = '6173426103:AAHMlY1TDCrvVFP-C-sTEWtPkqHlfWNn5pk'; // replace with the actual chat ID of the store owner
  //     let ownerMessage = `New order received from ${msg.from.first_name}:\n\n`;
  //     for (let itemId in cart) {
  //         let item = cart[itemId];
  //         ownerMessage += `*${item.name}*\nPrice: ${item.price}\nQuantity: ${item.quantity}\n\n`;
  //     }
  //     ownerMessage += `Total: ${total}\n\n`;
  //     ownerMessage += `To accept the order, type /accept ${chatId}\nTo decline the order, type /decline ${chatId}`;
  //     bot.sendMessage(ownerChatId, ownerMessage, { parse_mode: 'Markdown' });
  // });
  
  // // command for the store owner to accept an order
  // bot.onText(/\/accept (.+)/, (msg, match) => {
  //     let ownerChatId = msg.chat.id;
  //     let userChatId = parseInt(match[1]);
  //     let message = 'Your order has been accepted by the store owner. Thank you for your purchase!';
  //     bot.sendMessage(userChatId, message);
  // });
  
  // // command for the store owner to decline an order
  // bot.onText(/\/decline (.+)/, (msg, match) => {
  //     let ownerChatId = msg.chat.id;
  //     let userChatId = parseInt(match[1]);
  //     let message = 'Your order has been declined by the store owner. We apologize for the inconvenience.';
  //     bot.sendMessage(userChatId, message);
  // });
  
  // command to cancel the order and reset the shopping cart
  bot.onText(/\/cancel/, (msg) => {
      let chatId = msg.chat.id;
      cart = {};
      bot.sendMessage(chatId, 'Your order has been cancelled and your shopping cart has been emptied.');
  });
  
  // command to remove an item from the shopping cart
  bot.onText(/\/remove (.+)/, (msg, match) => {
      let chatId = msg.chat.id;
      let itemId = parseInt(match[1]);
      let item = cart[itemId];
      if (item) {
        inventory.find(i => i.id === itemId).quantity += item.quantity; // increase the quantity in inventory
        delete cart[itemId]; // remove the item from the cart
        bot.sendMessage(chatId, `Removed *${item.name}* from your cart.`, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `Invalid item ID. Please try again.`, { parse_mode: 'Markdown' });
      }
    });
  
  // command to display the help message
  bot.onText(/\/help/, (msg) => {
      let chatId = msg.chat.id;
      let message = 'Welcome to our store! Here are the available commands:\n\n';
      message += '/inventory - View the store inventory\n';
      message += '/order [item ID] - Add an item to your cart\n';
      message += '/cart - View your shopping cart\n';
      message += '/confirm - Confirm your order\n';
      message += '/cancel - Cancel your order and empty your shopping cart\n';
      message += '/remove - remove from cart cart\n';
      bot.sendMessage(chatId, message);
  });
  
  // Start the bot
  bot.on('message', (msg) => {
      let chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Welcome to our store! Type /help to see the available commands.');
  });
  
  
  
  
  
  // Register a command handler for /support
  bot.onText(/\/support/, (msg) => {
    // Define the options for customers to select from
    const options = {
      reply_markup: {
        keyboard: [
          ['Payment issues'],
          ['Order issues'],
          ['Other']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
  
    // Send a message to the customer with the options
    bot.sendMessage(msg.chat.id, 'Please select an issue:', options);
  });
  
  // Handle the customer's selection
  bot.on('message', (msg) => {
    // Check if the customer selected an issue
    if (['Payment issues', 'Order issues', 'Other'].includes(msg.text)) {
      // Handle the selected issue
      switch (msg.text) {
        case 'Payment issues':
          // Handle payment issues
          break;
        case 'Order issues':
          // Handle order issues
          break;
        case 'Other':
          // Ask the user to specify their issue
          bot.sendMessage(msg.chat.id, 'Please enter your issue:');
          break;
      }
  
      // Send a confirmation message to the customer
      bot.sendMessage(msg.chat.id, `You have selected "${msg.text}". Our team will assist you shortly. Thank you!`);
    } else {
      // Handle the user's specified issue
      bot.sendMessage(msg.chat.id, `Thank you for letting us know about "${msg.text}". Our team will assist you shortly. Thank you!`);
    }
  });
  
  
  
  
  // Error handling
  bot.on('polling_error', (error) => {
      console.log(error);
  });
  
  
  console.log('Bot started...');
  
  // End of code
  
  
  
    
    // Your bot code goes here
  };





