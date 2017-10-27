# Understanding features in NGRX 4

Working with NGRX can be challenging at times, and the state object in your app can grow to be a huge monster that makes your app hard to manage. This is counterintuitive, as introducing some sort of redux in your app should make everything easier, right?

One of the features in NGRX 4 is the ability to define features in your state. Features are separate slices of your store that can live for themselves. This in turn makes the AppState a network of separate states responsible for their own part of the application. There are a few blogposts out there on this, but there seems to be some misunderstandings anyway. So why not give my thoughts on it.

## Setting up shop

First things first, I'll set up a blank app with `@angular/cli` (make sure you have it globally installed `npm install -g @angular/cli`)

So, this will create my app:

`ng new ngrx-features --style scss`

Navigate to the newly created folder, and let's install the ngrx-dependencies:

`npm install @ngrx/store @ngrx/effects @ngrx/router-store`

## Importing the StoreModule

The first thing we need to do in our app is to get the dependencies for ngrx imported into our app. We can do this by adding two imports to our AppModule, `StoreModule` and `EffectsModule`. The important part here, is that in order to get the actual `ModuleWithImports` we need to do so by calling the static method `forRoot` on both. 

So in `app.module.ts`, add the following to the imports:

```javascript
imports: [
    ...
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    ...
]
```

There is nothing wrong with instansiating the `StoreModule.forRoot` with an empty object, since we don't have anything that needs to go into the store yet.

Now that we've added the dependencies, we'll add a `conosle.log` in our AppModule constructor for purposes only in this demo. In order to check what the state looks like at all times, we can add this constructor to our AppModule:

```javascript
import { Store } from '@ngrx/store'

export class AppModule {
  constructor(store: Store<any>) {
    store.select(s => s).subscribe(console.log.bind(console));
  }
}
```

> Important! Never do this in an actual application. This is just for debugging this demo-code

## Set up routing real quick

Before we start with our feature, let's bootstrap the router, by adding a MenuComponent:
`ng g c Menu`

Update the `app.module.ts` with some routes, and add the `RouterModule.forRoot(routes)` to our imports:

```javascript
export const routes: Routes = [
  {
    path: '',
    component: MenuComponent
  }
];

...


@NgModule({
  declarations: [
    ...
    MenuComponent
  ],
  imports: [
    ...
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})

```

Also remove all HTML in the `app.component.html` and replace it with a single `<router-outlet></router-outlet>`

## Adding a feature

Let's create our first feature. The requirements are simple: 
- It should be possible to navigate to `/users`
- This should display a list of users available to us
- The route should be guarded (we'll make the guard, but I'll leave the authentication out of scope for now)

Sounds simple enough, so by the magic of `@angular/cli` we can easily make a new module that will hold our feature:

`ng g m Users`

This will create a new folder `users` with a `users.module.ts` file in it. Lets add a single component as well (remember to navigate to `/src/app/users` before creating the component): 

`ng g c UserList`

While we're at it, let's get our guard up as well:

`ng g guard Users`

You should now have the following structure under `/users`:

```
/users
   /user-list
      user-list.component.html
      user-list.component.ts
      user-list.component.scss
      user-list.component.spec.ts
   user-list.guard.ts
   user-list.guard.spec.ts
   user.module.ts   
```
      
Let's add the route to our `user.module.ts` so that we can navigate to this component

```javascript
export const routes: Routes = [
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [UserListGuard],
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes) // remember forChild. Not forRoot
  ],
  declarations: [UserListComponent],
  providers: [UserListGuard]
})
export class UsersModule { }
```

Finally, let's stich it together by adding the `UsersModule` to our `AppModule` imports, and also adding a link to our `menu-component`:

```html
<a [routerLink]="['/users']" href="">Users</a>
```

If you run your app with `ng serve` now, you should se a blank page with a link to Users. Click that and you get the `User-list works!` text. You should also see a single console log statement logging an empty object:

```
 > {}
```

It's time to get some data!

## Setting up the UsersStore

*disclaimer: the way I structure the files for my store is highly subjective and in no way the 'right' way to do it. But it works for me :)*

We'll start by adding a content under the `users` folder with the following (empty) content:

```
/users/
    /users-store/
        models/
            user.ts
        users-store.actions.ts
        users-store.effects.ts
        users-store.reducer.ts
    users.store.ts
```

This is how I set up all my stores, and I find it easy to navigate and find whatever I'm looking for.

The `user.ts` is just a simplified version of the json-object returned by the `https://randomuser.me` api, which we'll implement in a minute:

```javascript
export interface User {
    name: Name;
    login: Login;
}

export interface Name {
    title: string;
    first: string;
    last: string;
}

export interface Login {
    username: string;
}
```

Let's do this file by file, starting with the actions:

### user-store.actions.ts

These are the actions that will have some sort of impact on our `users-store`

```javascript
import { User } from './models/user';
import { Action } from '@ngrx/store';

// We expose two actions, one to initiate loading, and one for handling the response
export const LOAD_USERS = '[Users] Load';
export const LOAD_USERS_COMPLETE = '[Users] Load:Complete';

export class LoadUsers implements Action {
    readonly type = LOAD_USERS;
}

export class LoadUsersComplete implements Action {
    readonly type = LOAD_USERS_COMPLETE;

    constructor(public users: User[]) { }
}

// for convenience, we export a new type with our Action-classes
export type Actions = LoadUsers | LoadUsersComplete;

```

### user-store.reducer.ts

I tend to define my state-interface along side the reducer for ease-of-access, and so far it has worked great for me, but if you're more comfortable with separate files for everything, there's nothing wrong with that here as well.

```javascript
import { User } from './models/user';
import * as usersActions from './users-store.actions';

export interface UsersState {
    users: User[];
    loading: boolean;
}

export const initialState: UsersState = {
    users: [],
    loading: false
};

export function usersReducer(state: UsersState = initialState, action: usersActions.Actions): UsersState {
    switch (action.type) {
        case usersActions.LOAD_USERS: {
            return {
                ...state,
                loading: true // Just set the loading flag to true. This action will mostly be handled by effects
            };
        }
        case usersActions.LOAD_USERS_COMPLETE: {
            return {
                ...state,
                users: action.users // these are the users returned from the data-source
                loading: false
            };
        }
        default:
            return state;
    }
}

```

### user-store.effects.ts

Currently, the only responsibility of this class is to actually fetch the users when the `LoadUsers` action is dispatched.

```javascript
import { User } from './models/user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import * as usersActions from './users-store.actions';


@Injectable()
export class UsersStoreEffects {

    // This will perform a GET https://randomuser.me/api/?results=10&seed=abc
    // and map the result into an action. Since we decorate it with @Effect,
    // it will automatically dispatch the resulting action to the store
    @Effect() fetchUsers$ = this.actions$
        .ofType(usersActions.LOAD_USERS)
        .switchMap(() => this.http.get<{ info: any, results: User[] }>('https://randomuser.me/api/?results=10&seed=abc')
            .map(res => new usersActions.LoadUsersComplete(res.results)));

    constructor(private actions$: Actions, private http: HttpClient) { }
}
```

We'll also need to add the `HttpClientModule` to our `UsersModule`:

```javascript
// users.module.ts


@NgModule({
  imports: [
    ...
    HttpClientModule,
    ...
  ],
  ...
})
export class UsersModule { }
```

## Adding our store to the app

Now, refreshing the app in your browser will be disappointing, since nothing has really changed. That's because we haven't added this part of the Store to our app yet. Let's start by defining our feature in `users.module.ts` that we created earlier on. Now this is the important part of the blog-post, and we've done a lot of boilerplate to get here.

The important part here is a static function on `StoreModule` called `forFeature`. The function takes a name and an object. The name is important, because it defines what the featureState will be called when it's added to the global stateobject. And it's also what we're going to need when we need to get that particular feature-slice from our state.

Let's look at the code:

```javascript
// users.module.ts
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { usersReducer } from './users-store/users-store.reducer';
import { UsersStoreEffects } from './users-store/users-store.effects';
...

@NgModule({
  imports: [
    ...
    StoreModule.forFeature('users', usersReducer),
    EffectsModule.forFeature([UsersStoreEffects]),
    ...
  ],
  declarations: [UserListComponent, UserDetailsComponent],
  providers: [UserListGuard]
})
export class UsersModule { }

```

In the code above we're telling the StoreModule to add a slice to the global state called `users` and the associated reducer is defined by usersReducer. 

> Keep in mind that this is a simple example, with a single reducer and a simple state for our feature. The reducer can be of type ActionReducerMap<SomeState>, and have multiple sub-states and reducers.

Now, refresh the browser, and behold the console.log. It should now display something along the lines of this:

```
> {users: {…}}
    > {users: Array(0), loading: false}
```

In other words, without touching our AppModule, other than importing our UsersModule earlier on, the State now contains our UsersState as well. Let's quickly dispatch an action to populate the list, and what other place is better than from our `UserListGuard`:

```javascript
// user-list.guard.ts
import { LoadUsers } from './users-store/users-store.actions';
import { UsersState } from './users-store/users-store.reducer';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserListGuard implements CanActivate {
  constructor(public store: Store<UsersState>) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.store.dispatch(new LoadUsers());

    return true;
  }
}

```
Now, obviously, this should be done differently, but I'll let the brilliant Todd Motto teach you that in his blogpost 
[Preloading ngrx/store with Route Guards](https://toddmotto.com/preloading-ngrx-store-route-guards)

We'll also need to implement the display of the users in our  `UserListComponent`, and for that we have to create our first selector, in order to get our data out from our store. Let's add some code to our `users-store.reducer.ts`

### Selectors

A selector is a function that will drill into the Store and return a specific part of the state for you. The function gets memoized, so it only ever reevaluates if the state changes, which is awesome for `ChangeDetectionStrategy.OnPush`

Let's create selectors for our UsersState:

```javascript
// users-store.reducer.ts

...
// all the way in the bottom of the file:

export const getUserEntities = (state: UsersState) => state.users;
```

So, basically we're defining a function that takes an object of type `UsersState`, and returns the `users` property from that object. That's pretty straight forward. The magic, however, is how we're supposed to make sure the correct object is passed into this function. Let's jump into our `users.store.ts` that we created further up, and define some stuff there.

First off, we're going to create a very specific selector that tells ngrx how to get a hold of this particular feature:

```javascript
// users.store.ts
import * as fromUsersStore from './users-store/users-store.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getUsersFeatureState = createFeatureSelector<fromUsersStore.UsersState>('users');
```

What this little line tells the store, is that it should find a State of type `UsersState` on the property `'users'`, and if you remember, this is the same name as we used when importing `StoreModule.forFeature('users', usersReducer)` on our `UsersModule`.

Now, for the actual selector that will return our users we can use this featureSelector, to drill into our `UsersState`:

```javascript
import * as fromUsersStore from './users-store/users-store.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getUsersFeatureState = createFeatureSelector<fromUsersStore.UsersState>('users');

export const getUserEntities = createSelector(getUsersFeatureState, fromUsersStore.getUserEntities);
```

By using `createSelector`, we can combine the feature-selector with a selector defined further down in our state-tree. The important part here, is that this part of the store should know as little as possible about the actual `UsersState`, so if we change the way we access users within our `users-store.reducer.ts` all we need to do is change the selector _there_ and not bother with this.

Let's hook this up to the view:
```javascript
// user-list.component.ts

import { Observable } from 'rxjs/Observable';
import { User } from './../users-store/models/user';
import { Store } from '@ngrx/store';
import { UsersState } from '../users-store/users-store.reducer';
import * as fromUsers from '../users.store';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {

  users$: Observable<User[]>;

  constructor(public store: Store<UsersState>) {
    this.users$ = store.select(fromUsers.getUserEntities); // The selector from users.store, NOT from the reducer itself.
  }
}

```

```html
<!-- user-list.component.html -->

<ul>
  <li *ngFor="let user of users$ | async">
    {{user.name.first}}
  </li>
</ul>
```

Refresh your browser, click the Users-link and behold the list of users!

### Very short recap

So what did we do? Well, we've created a feature for a UserList that is completely independent. The part of the state that holds users will never be loaded unless we import the UsersModule. This is well and good, but since we need to navigate to the route, we _have to_ import the module in the AppModule... Or do we? 

## Enter Lazy loading

Luckily, with the standard angular-cli setup, lazy-loading modules is a breeze, and it really illustrates the strength of ngrx features. All we have to do is to change a few lines in out `app.module.ts` and our `users.module.ts`:

First in `app.module.ts` we add the route to users, but tell it to lazy-load the module with `loadChildren` instead.
Additionally we remove the `UsersModule` from the imports

```javascript
... 
export const routes: Routes = [
  {
    path: '',
    component: MenuComponent
  },
  {
    path: 'users',
    loadChildren: './users/users.module#UsersModule'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument(),
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(store: Store<any>) {
    store.select(s => s).subscribe(console.log.bind(console));
  }
}

```

And, in `users.module.ts` the only thing we need to change, is to set `path` to `''`, since our `AppModule` now defines the path to this module:

```javascript
export const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [UserListGuard],
  }
];
```

Now, pay attention to the console.log output when you refresh your browser on the root url. It should again be an empty object. Navigate to `/Users`, and watch as the state suddenly gets a new property `users`, which is populated by our routeguard.

## In closing

Architecting your Store can be a pain in the a**, but if you keep your states small and manageable, refactoring and maintaining your codebase will be drastically simpler afterwards. The `forFeature` is imperative in order to get to this point, but it has to be understood. Some blogs I've read define the feature-state on some global state-object, leading to the state always being added to the store. This makes the feature bleed functionality up the tree, even if you implement lazy-loading, and is bad practice in my humble opinion.

Hope you enjoyed this quick-and-dirty post about features in ngrx. If you have questions, you can find me in `#angular` angularbuddies.slack.com as @yngvebn, or tweet to me at https://twitter.com/@yngvenilsen