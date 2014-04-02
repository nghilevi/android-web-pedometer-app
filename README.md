Pedometer-App
=============

Introduction 
-------
Pedometer is an instrument for estimating the distance traveled on foot by recording the number of steps taken.

This project includes Pedometer android app (which tracking your steps, calculate your speed, calories etc.) and a web app's prototype. The web app is a single page application dashboard web page where you can find graphical chart illustration of your data. You can also set goals for each category (such as number of steps or calories that you want to burn a day in that current day). These goals' data will also be collected and displayed on the graph after that to give you insights on how well you have done. 

The data displayed on the web is synchronized  with those on your device on real time. That's a great feature in especially in situation where a doctor/nurse want to see and keep track of your progress live. The UI is easy to understand, the user just need to use once or twice to knowo how to use all the options.  At the moment, all the information that the users need can be retrieved in one single page so that they don't need to open a new tab/navigate to a new page, which can help them save time and enhance user experience as well.

![ScreenShot](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-WebDashboard.png)

A sample screenshot showing how many calories you have burnt from the last 14 days. Seems like you are doing very well, time to set higher goals. Also below is our app screenshot, where data will be updated every step you go into the cloud.

![ScreenShot](https://raw.githubusercontent.com/vinhnghi223/Pedometer-App/master/Screenshot-AndroidApp.png)

Demo notes
-------
To use the web app, just go to http://www.codingisloving.com/WEBAPPS/pedometer/index.html
For its openness and demonstrational purposes it has not required any layer of authentication at the moment. Anyone can use it and set/modify goals of current date.

To get the app apkk file and install it on your device, just go to this link and click on Raw to download: https://github.com/vinhnghi223/Pedometer-App/blob/master/Pedometer-Android-App.apk

Development notes
-------
The android app is built using Firebase library for Android and the pedometer open-source app.
The web app is built using Angular.js, FireAngular, Bootstrap 3, jQuery, jQuery Highchart library, and there's one part is built using D3.js but has not been fully integrated.

Future development notes
-------
As I said there's one part of the web app has been built using D3.js but not completed yet. 
There's a small bug (that I think was a result of Bootstrap and Highchart's conflict) that requires users to refresh the graph once when they first open the web site to be able to see it in full width. 
One of my friend also test it and he said there should be some notification system for notify when you achieve/exceed your goals. 
In my opinion there should also be a feature to export data to csv as well. Also the data displayed on the graph can also be filtered by start and end date, not only by date range as at the moment.
