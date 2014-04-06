Pedometer-App
=============

Introduction 
-------
Pedometer is the name of an instrument that estimates the distance traveled on foot by recording the number of steps taken.  (Please see the Demo Notes section below or [video demo](http://goo.gl/S9762r) to learn more about how to use the app)

This project includes Pedometer android app (which tracking your steps, calculate your speed, calories etc.) and a web app's prototype which is a single page application dashboard where you can find graphical chart illustration of your data. You can also set goals for each category (such as number of steps or calories that you want to achieve in a day). These goals' data will then also be collected and displayed on the graph which will give you insights on how well you have done. 

The data displayed on the web is synchronized  with those on your device on real time. Imagine a situation where doctor/nurse can see and keep track of their patients' exercises progress remotely. The UI is built with the idea that the user just need to use once or twice to know how to use all the options. All the information needed will be provided for the users in one single page so that they don't need to open a new tab/navigate to another page, which can help in saving time and enhance user experience as well.

![ScreenShot](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-WebDashboard.png)

A sample screenshot showing how many calories you have burnt from the last 10 days. Click on the thumbnail below to view demo video.

[![Alt text for your video](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-Youtube.png)](http://goo.gl/S9762r)

Also below is the app screenshot, where data will be updated and push onto the cloud every step you go .

![ScreenShot](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-AndroidApp.png)

Demo notes
-------
Here is the [Demo Link](http://goo.gl/tuD8Vz) of the web app.
Download the android apk [here](http://goo.gl/THILXx) (Click on Raw).

In the web app, The user only need to sign in either via Facebook or anonymously to be able to set/modify goals of current date. In the android app, the user also need to login as anonymous to be able to sync data. 

Development notes
-------
The android app is built using Firebase libraries for Android and the pedometer open-source app.
The web app is built using Angular.js, FireAngular, Bootstrap 3, jQuery, jQuery Highchart library,Firebase authentication library and there's one part is built using D3.js but has not been fully integrated.

At the moment, both the web and android app do not have the capability to store any personal user data, except what they modified. The implementation of authentication is just for future ideal development and desmonstration purpose. 

Future development notes
-------
As I said there's one part of the web app has been built using D3.js but not completed yet. 
It would be fun if there are some kinds of notification systems for notify when you achieve/exceed your goals. 
There should also be a feature to export data to csv as well. 
The data displayed on the graph can also be filtered by start and end date, not only by date range.
