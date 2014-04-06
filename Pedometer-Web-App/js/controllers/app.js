var app = angular.module("myapp", ["firebase"]);


/*this function will be called by Angular. Once we have the scope, we can then assign variables to the scope*/
function MyController($scope, $firebase) {
	/* ******* GET CURRENT DATE ******* */
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	  dd='0'+dd
	} 

	if(mm<10) {
	  mm='0'+mm
	} 

	$scope.today = yyyy+'-'+mm+'-'+dd;  

	/* ******* CONNECT SERVER ******* */
	//var FIREBASE_URL="https://timetrackingapp.firebaseio.com/";
	var FIREBASE_URL="https://pedometertracking.firebaseio.com/";
	var rootRef = new Firebase(FIREBASE_URL); //The whole root of firebase, will be then used in showGraph()
	FIREBASE_URL+=$scope.today; //only today metrics
	var todayRef = new Firebase(FIREBASE_URL)
	$scope.metrics = $firebase(todayRef); //Initialize $scope.metrics 

	/* ******* OAUTH BUTTONS AND VISIBILITY ******* */

	$scope.bulletsViewVisibility=null;
	$scope.instructionVisible = true;
	$scope.GoalStepsEdit= false; //Submit and Cancel bubttons for goalSet are set invisible at first
	$scope.GoalDistanceEdit= false;
	$scope.GoalPaceEdit= false;
	$scope.GoalSpeedEdit= false;
	$scope.GoalCaloriesEdit= false;
	$scope.LogInState= false;
	$(".profilePic").hide();

    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
      if (error) { // an error occurred while attempting login
        switch(error.code) {
          case 'INVALID_EMAIL':
          case 'INVALID_PASSWORD':
          default:
        }
      } else if (user) { // user authenticated with Firebase
      	$scope.LogInState= true;
        var strSrc;
        if(user.provider=="facebook"){
			strSrc="http://graph.facebook.com/" + user.id + "/picture?type=square";
			$("#username").text(user.displayName);
        }else{
        	strSrc="anonymous.png";
        	$("#username").text("Anonymous");
        }
		$(".profilePic").attr('src', strSrc); 
		$(".loginBtn").hide();
		$(".profilePic").show();
      } else {
        auth.logout();
        $(".loginBtn").show();
        $(".profilePic").hide();
      }        
    });        

    $scope.logInFB=function(){
      auth.login('facebook', {
        rememberMe: false,//just for testing, should be true to rmb 30 days
        scope: 'email,user_likes'
      }); 
    }

    $scope.logInAnonymous=function(){
      auth.login('anonymous');
    }        

    $scope.logOut=function(){
      auth.logout();
      $(".loginBtn").show();
      $(".profilePic").hide();
      $scope.LogInState=false;
    }

	/* ******* INPUT VALIDATION ******* */
	function isPositiveInteger(value) {
		return /^\+?(0|[1-9]\d*)$/.test(value);
	}

	function isPositiveDecimal(value){
		return (/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(value));
	}

	function isPositiveNumber(value){
		return !(!value || isNaN(value) || value<0); //!value return true when value in {0,null,""} rmb 0 is just an integer, it's neither a positive nor negative integer
	}

	function filterInputForModifiedGoal(stringId,goalType,oldValue) {
		var result=false;
		var jqueryObj=$(stringId);
		var value=jqueryObj.html();

		function disallowInvalidInput(){
			jqueryObj.html(oldValue);
			value=oldValue;
			alert("Please enter a proper input value!");			
		}

		if($scope.typesTable[goalType].dataType=="integer"){
			result=isPositiveInteger(value);

		}else{
			result=isPositiveDecimal(value);
		}

		if(!result){
			disallowInvalidInput();			
		}

		return value;	
	}

	function filterInputForDayLimit(value){
		 var result = isPositiveInteger(value) && (value<100);
		 if(!result){
		 	value=1;
			alert("Your input will be set to 1, please enter a valid number of days, which is a positive integer and less than 100");
		 }
		 return value;
	}

	function filterInputForDataReceivedFromServer(value){
		if((value+"").charAt(0)=='.'){
			value=parseFloat("0"+value);
		}
		var result=isPositiveNumber(value);
		if(!result){
			value=0;
		}
		return value;
	}


	function validateInputAndReturnValue(unreliableValue, unreliableGoalType, stringId, oldValue, alertNotification){
		var result1 = true;
		var result2 = true;
		var jquerySelector;
		var value = unreliableValue;
		var goalType=unreliableGoalType || "Steps";

		if(!stringId){
			jquerySelector = $(stringId);
			value=jquerySelector.html();
		}

		if(!value || isNaN(value)){
			result1=false;
		}

		if($scope.typesTable[goalType].dataType=="integer"){
			result2=isPositiveInteger(value);
		}else{
			result2=isPositiveDecimal(value);
		}

		if(!result1 || !result2){
			value = oldValue || 0;
			if(!stringId){
				jquerySelector.html(oldValue);
			}
		}

		if(alertNotification){
			alert("Just to let you know that, your just entered an invalid number");
		}
		return value;
	}

	/* ******* SET INITIAL VALUES ******* */
	$scope.numberOfViewedDays = 10;
	$scope.typesTable={ //An obj containing information of each type of metrics,act like a reference/dictionary
		Steps:{
			type: "Steps", //use as parameter for onEditMode(typesTable.Steps.type), create typeArray (below)
			goalTypeId: '#goalSteps',
			goalTypeName: 'GoalSteps', //use for create goalTypesArray (below)
			goalValue: null,
			strTitle: 'Step(s)',
			strTooltipSuffix: ' Steps',
			refreshBtn: 'StepsTypeRefresh',
			dataType: 'integer',
			classNameStr: '.StepsLabel'
		},
		Distance:{
			type: "Distance",
			goalTypeId: '#goalDistance',
			goalTypeName: 'GoalDistance',
			goalValue: null,
			strTitle: 'Kilometer(s)', 
			strTooltipSuffix: ' kilometers',
			refreshBtn: 'DistanceTypeRefresh',
			dataType: 'decimal'						
		},
		Pace:{
			type: "Pace",
			goalTypeId: '#goalPace',
			goalTypeName: 'GoalPace',
			goalValue: null,
			strTitle: 'Step(s)/minute',
			strTooltipSuffix: ' step(s)/minute',
			dataType: 'integer'									
		},
		Speed:{
			type: "Speed",
			goalTypeId: '#goalSpeed',
			goalTypeName: 'GoalSpeed',			
			goalValue: null,	
			strTitle: 'Kilometer(s)/hour', 
			strTooltipSuffix: ' kilometer(s)/hour',
			dataType: 'decimal'	
		},
		Calories: {
			type: "Calories",
			goalTypeId: '#goalCalories',
			goalTypeName: 'GoalCalories',		
			goalValue: null,
			strTitle: 'Calories',
			strTooltipSuffix: ' Calories',
			dataType: 'decimal'											
		}	 
	}

	var typeArray=[];
	var goalTypesArray=[];

	var table=$scope.typesTable;

	for(e in table){
		typeArray.push(table[e].type);
		goalTypesArray.push(table[e].goalTypeName);		
	}

	//Partials Bulletview
	$scope.bulletsView="partials/index.html"; 
	$scope.showBulletView=function(){
		$scope.bulletsViewVisibility=true;
	}
	$scope.hideBulletView=function(){
		$scope.bulletsViewVisibility=false;
	}	


	/************************************************************ GRAPH MODULE ************************************************************/

    var graphObj ={ //This graphObject will be overwritten later in showGraph()
    	initial: true,
	    title: {
	        text: 'Please click on one of the metrics above to view corresponding graph!',
	        x: -20 //center
	    },
	    subtitle: {
	        text: '',
	        x: -20
	    },
	    xAxis: {
	        categories: []
	    },
	    yAxis: {
	        title: {
	            text: 'y Axix\'s Title'
	        },
	        plotLines: [{
	            value: 0,
	            width: 1,
	            color: '#808080'
	        }]
	    },
	    tooltip: {
	        valueSuffix: ' valueSuffix'
	    },
	    legend: {
	        layout: 'vertical',
	        align: 'right',
	        verticalAlign: 'middle',
	        borderWidth: 0
	    },
	    series: [{
	        name: 'Goal',
	        data: []
	    }, {
	        name: 'Real',
	        data: []
	    }]
	}

	//Deserver a populateDataIntoArrays and showGraphHelper class
	function PopulateDataHelper() {
		this.datesArray=[];
		this.goalsArray=[];
		this.realMetricsArray=[];
		$scope.numberOfViewedDays=filterInputForDayLimit($scope.numberOfViewedDays);
		this.numberOfViewedDays=$scope.numberOfViewedDays;

		this.checkInReceivedData=function(array,isTypeArray){
			var updates={};
			var flagForUpdate=false;
			var countReceivedNullValues=0;	
			for(i=0;i<=array.length-1;i++){
				var receivedValue=$scope.metrics[array[i]];
				if(!isPositiveNumber(receivedValue)){
					flagForUpdate=true; //even if just one of types or typeGoals is 0 then, then update that one, even update that to 0 again, the point is when its null, it should update
					$scope.metrics[array[i]]=0;
					//updates[array[i]]=$scope.metrics[array[i]];	
					if(isTypeArray){
						countReceivedNullValues++; //If all 5 types are 0/null then warning appear
					}
				}
			}
			if(flagForUpdate){
				updates.DateString=dd+'/'+mm+'/'+yyyy; 
				$scope.metrics.$update(updates);
			}
			return countReceivedNullValues;					
		}		

		this.pushDataToArrays=function(metricalType,refinedDataWithKey){
			var typeObj=$scope.typesTable[metricalType];
			var inputValue=refinedDataWithKey[metricalType];
			var inputGoalValue=filterInputForDataReceivedFromServer(refinedDataWithKey[typeObj.goalTypeName]);
			
			if(typeObj.dataType=="integer"){
				inputValue=parseInt(inputValue);
				inputGoalValue=parseInt(inputGoalValue);
			}else{
				inputValue=parseFloat(inputValue);
				inputGoalValue=parseFloat(inputGoalValue);
			}
			this.datesArray.push(refinedDataWithKey.DateString);
			this.realMetricsArray.push(inputValue);
			this.goalsArray.push(inputGoalValue);
		}	

		this.reverseAndLimitArray=function(originalArray){
			var finalArray=[];
			tempArray=originalArray.reverse();
			for(i=0;i<$scope.numberOfViewedDays;i++){
				finalArray.push(tempArray[i]);
			}
			finalArray.reverse();
			return finalArray;	
		}		
	}


	function populateDataIntoArrays(metricalType){ 
		$('#daysLimitInput').prop('disabled', graphObj.initial); 

		limitedData=rootRef.endAt().limit(100); //Only get the latest 100 data

	  	limitedData.on('value', function(snapshot) {
		  	var refinedData = snapshot.val();
			
			var helper = new PopulateDataHelper();
			var countReceivedNullValues=helper.checkInReceivedData(typeArray,true);
			helper.checkInReceivedData(goalTypesArray);

			if(countReceivedNullValues==5){
				$scope.receiveNoDataNotificationVisible=true;
			}else{
				$scope.receiveNoDataNotificationVisible=false;
			}						

			for (var key in refinedData) { //Push values into array from data received from firebase/server
				var refinedDataWithKey= refinedData[key];
				helper.pushDataToArrays(metricalType,refinedDataWithKey);
			}

			$(function () { 
				graphObj.title.text= metricalType+': Last '+$scope.numberOfViewedDays+' days\' Statistics';
				graphObj.xAxis.categories=helper.reverseAndLimitArray(helper.datesArray);
				graphObj.series[0].data=helper.reverseAndLimitArray(helper.goalsArray)		    	
				graphObj.series[1].data=helper.reverseAndLimitArray(helper.realMetricsArray);
				graphObj.yAxis.title.text=$scope.typesTable[metricalType].strTitle;
				graphObj.tooltip.valueSuffix=$scope.typesTable[metricalType].strTooltipSuffix;
				graphObj.initial=false;	
			});	
		});	
	}

	$scope.showGraph=function(metricalType){
		populateDataIntoArrays(metricalType);//unable to see at first because at first time, data still not be able to populate into this
		//should have built sth like var graph = new graphObj(parameters); $('#graphView').highcharts(graph); //even populate stuff is now inside graphObj
		$('#graphView').highcharts(graphObj);
		$scope.currentType=metricalType;
	}

	
	/************************************************************ SET/MODIFY GOAL MODULE ************************************************************/
 	//Simple validation area
	//Check to see if updated value is NaN or <0 , if it is then get the old value of the model
	function returnUpdatedValue(goalType,stringId,oldValue){ ///REPLACE
		var jqueryObj=$(stringId);
		var value=jqueryObj.html();
		function disallowInvalidInput(){
			jqueryObj.html(oldValue);
			value=oldValue;
			alert("Please enter a proper input value!");			
		}		
		if(isNaN(value) || value<0){
			disallowInvalidInput();
		}
		if($scope.typesTable[goalType].dataType=="integer" && !isPositiveInteger(value)){
			disallowInvalidInput();
		}
		return value;					
	}
	
	//populate values from $scope.metrics to typeTable
	function populateMetricsValuesToTypeTable(){
		var typeTable=$scope.typesTable;
		var metrics=$scope.metrics;
		for(i=0;i<=typeArray.length-1;i++){
			typeTable[typeArray[i]].goalValue=metrics[goalTypesArray[i]];
		}		
	}

	function showOrHideEditLabelsAndReturnUpdatedObject(goalType,booleanValue,value){
		var editGoalTypeName="Goal"+goalType+"Edit";
		$scope[editGoalTypeName]= booleanValue;
		updates={};
		updates[$scope.typesTable[goalType].goalTypeName]=value;
		return updates;	
	}
	
	$scope.onEditMode=function(editType){
		showOrHideEditLabelsAndReturnUpdatedObject(editType,true, null);
		var stringID=$scope.typesTable[editType].goalTypeId;	
		$(stringID).focus();
	}

	$scope.submitChanges=function(goalType){
		console.log($scope.LogInState);
		if($scope.LogInState){
			populateMetricsValuesToTypeTable();
			var updatedGoal, updates;
			var stringId=$scope.typesTable[goalType].goalTypeId;
			var oldValue=$scope.typesTable[goalType].goalValue;
			value=filterInputForModifiedGoal(stringId,goalType,oldValue);
			$scope.metrics.$update(showOrHideEditLabelsAndReturnUpdatedObject(goalType,false,value));			
		}else{
			$scope.cancel(goalType);
			alert("Please sign in to be able to modify!");
		}
	}

	$scope.cancel=function(goalType){
		populateMetricsValuesToTypeTable();
		var stringId=$scope.typesTable[goalType].goalTypeId;
		var oldValue=$scope.typesTable[goalType].goalValue;		
		$(stringId).html(oldValue);
		showOrHideEditLabelsAndReturnUpdatedObject(goalType,false, null);
	}

	$scope.showGraph("Steps");
	/************************************************************ EXPORT TO JSON MODULE ************************************************************/
	//For premium user only

		

}