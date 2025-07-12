# Aliases
Alex602 = AlexLuo602

## Website Name
Ivy's Crochet World
## Description
I created a shopping website for the crochets that my sister made. All of the photos shown on the website are crochets that my sister actually made. The home page consistes of a grid of crochets for sale, as well as some useful links for the user, such as categories, search, and shopping cart. The navbar will exist throughout all of the pages, and will offer the user a useful way to navigate the website.
## Build Instructions
- docker-compose up --build
- navigate to http://localhost:3000/
## Extra Feature 1
- Added a feature under admin page to edit items. Once you click on the edit items link, you can choose an item from the item card grid. Once you click on an item, you go into edit item page. From here, the boxes are prefilled with the original item information. You can feel free to change anything there. Click submit update to successfuly update the item.
- In the edit items page, there is also an add item button. Clicking on this will lead you to a form where you can fill in the information for the item. Once you are done, you can click submit, and it will bring you back to the edit items page, where you can see the item you just made. Going back to the home page, the item will still be there for you to see.
## Extra Feature 2
Wishlist. Users can access the wishlist through the navbar. They can add items in the item description page. When the user adds the item, the button will dynamically change to "remove from wishlist", and this will persist throughout the session. I stored the wishlist items using redux, and the wishlist slice is accessed by both my item details page and the wishlist page. The item details page accesses the wishlist slice to send an action to add the item to the wishlist when the button is clicked. It also dynamically checks if the item is in the wishlist, and will update the button to "add..." or "remove..." accordingly. The wishlist page accesses the wishlist slice to display the items, and to allow the user to remove items or clear the wishlist of all items.
## Feature I'm the most proud of
I spent a lot of time trying to get the shopping cart icon to dynamically update to display the number of items added to the cart so far. I did this by overlaying a div element with {quantity} as the value onto the cart icon. I conditionally render it so it only appears when I have items added to the cart.
## References
- Boilerplate code to setup server from CPSC 310 repo: https://github.com/yood2/ubc-course-explorer
- Learn express: https://www.youtube.com/watch?v=SccSCuHhOw0
- Setting up MongoDB: https://www.youtube.com/watch?v=c2M-rlkkT5o
- Learning Docker Compose: https://docs.docker.com/compose/gettingstarted/
- Learn about MongoDB aggregation to handle the complex search feature: https://www.mongodb.com/docs/manual/tutorial/aggregation-examples/filtered-subset/
- Learning about Multer library for file uploading on backend https://www.npmjs.com/package/multer
- Learned React from this tutorial: https://www.youtube.com/watch?v=G6D9cBaLViA
