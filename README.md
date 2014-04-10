Pedometer is the name of an instrument that estimates the distance traveled on foot by recording the number of steps taken. Please see the Demo Notes section below or watch my [demo 46s video](http://goo.gl/S9762r) (set the speed to 0.5 slower if you find it too fast) to get the idea of how the app works.

##Table of Contents##

- [Introduction](#introduction)
- [Screenshots](#screenshots)
- [Demo notes](#demo-notes)
- [Development notes](#development-notes)
    - [Technologies used](#technologies-used)
    - [Future development](#future-development)

##Introduction##
This project includes Pedometer android app (which tracks your steps, calculates your speed and calories etc.) and a web app which is a single page application dashboard where you can find graphical chart illustration of your data. You can also set goals for each category (such as number of steps or calories that you want to achieve in a day). These goals' data will then also be collected and displayed on the graph which will give you insights on how well you have done. 

The data displayed on the web is synchronized  with those on your device on real time, which is a great and useful feature. Imagine situation where doctor/nurse can see and keep track of their patients' exercises progress remotely. The UI is built with the idea that the user just need to use once or twice to know how to use all the options. All the information needed will be provided for the users in one single page app so that they don't need to open a new tab/navigate to another page, which can help in saving time and enhance user experience as well.

##Screenshots##
![ScreenShot](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-WebDashboard.png)

A sample screenshot showing how many calories you have burnt from the last 10 days. Click on the thumbnail below to view demo video.

[![Alt text for your video](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-Youtube.png)](http://goo.gl/S9762r)

Also below is the app screenshot, where data will be updated and push onto the cloud every step you go .

![ScreenShot](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-AndroidApp.png)

##Demo notes##
Web app Demo Link: [Demo Link](http://goo.gl/tuD8Vz) of the web app. 
APK File (Click on Raw to download): [Download](http://goo.gl/THILXx).

In the web app, The user only need to sign in either via Facebook or anonymously to be able to set/modify goals of current date. In the android app, the user also need to login as anonymous to be able to sync data. 

##Development notes##
###Technologies used:
   *  AngularJS
   *  FireAngular
   *  Bootstrap 3
   *  jQuery
   *  jQuery Highchart
   *  firebase-simple-login
   *  firebase-client-jvm
   *  pedometer open-source
   *  Firebase
   *  D3.js (has not been fully integrated)

###Future development notes
   *  implement D3.js module
   *  systems that notify user when they achieve/exceed their goals
   *  feature to export data to csv as well
   *  graph data can also be filtered by start and end date
   *  auto generate & update data if the user happens to not open the web/android app that day

