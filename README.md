# backlogr

Demo: http://billdami.github.io/backlogr-angular

backlogr is an experimental web app built with angular.js for tracking and managing your video game collection and backlog. At this point in time, it is **not meant to be a production-ready application** for use by the general population. With this in mind, please do not rely on it to be a stable location for storing your games, as it could change or be taken down at any time, with no warning.

I built this app mainly as a way to get my feet wet with using angular.js, and to explore its strengths and weaknesses when used to create slightly more complex web applications. As a an avid gamer, I thought that an app for tracking your game backlog would be a perfect test and would fit nicely as a traditional "CRUD" type application. To make the app more useful, and to make it come alive a bit more, I've connected it to the excellent [GiantBomb API](http://www.giantbomb.com/api/) and games database. The app makes requests to a custom node.js based REST API that I developed, which serves a cached version of GiantBomb's data from a MongoDB database, which makes searching it from the app even faster and easier, and allows things like the game box art to be incorporated into the interface.

## Key components & features

* Backed by the [GiantBomb games database](http://www.giantbomb.com/api/), cached to a MongoDB database and served from a custom node.js API
* Stores the user's games and configuration data in browser localStorage
* Fully responsive and mobile friendly user interface (built on top of [Bootstrap v4 alpha](http://v4-alpha.getbootstrap.com/), and uses [fastclick](https://github.com/ftlabs/fastclick) for lag-free touch interaction)
* Uses [ui-router](https://github.com/angular-ui/ui-router) for page/view routing with URL support
* Custom built combo-box/auto-complete widget directive (for searching the games database)
* Custom built toast notifications directive
* CSS3 Animations with [ngAnimate](https://docs.angularjs.org/api/ngAnimate) (for modals, dropdowns, notifications, list items)
* Keyboard control support with [angular-hotkeys](https://github.com/chieffancypants/angular-hotkeys)

## About the creator

I am a web developer based in Orange County, New York. I have a passion for front-end development, and much of my time is spent crafting pixel perfect UIs and intuitive user experiences. For more information about me, and to see more of my work, check out my personal website, [billdami.com](http://billdami.com).

## License

This software is not licensed, meaning default US copyright laws apply. All rights to the source code are retained by Bill Dami, and it may not be reproduced, distributed, or recreated as derivative works.

&copy; 2016 Bill Dami.