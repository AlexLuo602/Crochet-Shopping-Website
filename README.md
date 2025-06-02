# Name
Alex Luo
# Assignment 2
## Description
I created a shopping website for the crochets that my sister made. All of the photos shown on the website are crochets that my sister actually made. The home page consistes of a grid of crochets for sale, as well as some useful links for the user, such as categories, search, and shopping cart. The navbar will exist throughout all of the pages, and will offer the user a useful way to navigate the website.
## Extra Feature
Wishlist. Users can access the wishlist through the navbar. They can add items in the item description page. When the user adds the item, the button will dynamically change to "remove from wishlist", and this will persist throughout the session. I stored the wishlist items using redux, and the wishlist slice is accessed by both my item details page and the wishlist page. The item details page accesses the wishlist slice to send an action to add the item to the wishlist when the button is clicked. It also dynamically checks if the item is in the wishlist, and will update the button to "add..." or "remove..." accordingly. The wishlist page accesses the wishlist slice to display the items, and to allow the user to remove items or clear the wishlist of all items.
## Feature I'm the most proud of
I spent a lot of time trying to get the shopping cart icon to dynamically update to display the number of items added to the cart so far. I did this by overlaying a div element with {quantity} as the value onto the cart icon. I conditionally render it so it only appears when I have items added to the cart.
