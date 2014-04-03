var app = angular.module("myapp", ["firebase"]);


/*this function will be called by Angular. Once we have the scope, we can then assign variables to the scope*/
function MyController($scope, $firebase) {
	//get today's date
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

	/**Visibility**/
	$scope.graphVisibility=null;
	$scope.bulletsViewVisibility=null;
	$scope.instructionVisible = true;

	//Submit and Cancel bubttons for goalSet functionality are set invisible at first
	$scope.GoalStepsEdit= false;
	$scope.GoaldistanceEdit= false;
	$scope.GoalPaceEdit= false;
	$scope.GoalSpeedEdit= false;
	$scope.GoalCaloriesEdit= false;

	//Inputting Validation System
	function isPositiveInteger(value) {
		return /^\+?(0|[1-9]\d*)$/.test(value);
	}

	function isPositiveDecimal(value){
		return (/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(value));
	}

	function isPositiveNumber(value){
		return !(!value || isNaN(value) || value<0);
	}

	/*Test cases
	testCases={
		0: -100,
		1: -100.999,
		2: null,
		3: "",
		4: "1a",
		5: 100,
		6: 100.99,
		7: 101,
		8: .1
	}

	console.log("isPositiveNumber");
	for(i in testCases){
		console.log(testCases[i]+": "+isPositiveNumber(testCases[i]));
	}
	console.log("isPositiveDecimal");	
	for(i in testCases){
		console.log(testCases[i]+": "+isPositiveDecimal(testCases[i]));
	}
	console.log("isPositiveInteger");	
	for(i in testCases){
		console.log(testCases[i]+": "+isPositiveInteger(testCases[i]));
	}*/
	

	function filterInputForModifiedGoal(stringId,goalType,oldValue) {
		var result=false;
		var jqueryObj=$(stringId);
		var value=jqueryObj.html();

		function disallowInvalidInput(){
			jqueryObj.html(oldValue);
			value=oldValue;
			alert("Please enter a proper input value!");			
		}

		if(typesTable[goalType].dataType=="integer"){
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
			alert("Your input will be set to 1, please enter an valid number of days, which is a positive integer less than 100");
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
		var goalType=unreliableGoalType || "steps";

		if(!stringId){
			jquerySelector = $(stringId);
			value=jquerySelector.html();
		}

		if(!value || isNaN(value)){
			result1=false;
		}

		if(typesTable[goalType].dataType=="integer"){
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

	$scope.numberOfViewedDays = 10;

	$scope.stepsType = "steps";
	$scope.distanceType= "distance";
	$scope.paceType= "pace";
	$scope.speedType= "speed";
	$scope.caloriesType= "calories";

	/*An obj containing information of each type of metrics,act like a reference/dictionary
	to look up for their values, for eg datatype, use typesTable[metricType].dataType*/

	typesTable={
		steps:{
			goalTypeId: '#goalSteps',
			goalTypeName: 'GoalSteps',
			goalValue: null,
			strTitle: 'Step(s)',
			strTooltipSuffix: ' steps',
			refreshBtn: 'stepsTypeRefresh',
			dataType: 'integer'
		},
		distance:{
			goalTypeId: '#goalDistance',
			goalTypeName: 'GoalDistance',
			goalValue: null,
			strTitle: 'Kilometer(s)', 
			strTooltipSuffix: ' kilometers',
			refreshBtn: 'distanceTypeRefresh',
			dataType: 'decimal'						
		},
		pace:{
			goalTypeId: '#goalPace',
			goalTypeName: 'GoalPace',
			goalValue: null,
			strTitle: 'Step(s)/minute',
			strTooltipSuffix: ' step(s)/minute',
			dataType: 'integer'									
		},
		speed:{
			goalTypeId: '#goalSpeed',
			goalTypeName: 'GoalSpeed',			
			goalValue: null,	
			strTitle: 'Kilometer(s)/hour', 
			strTooltipSuffix: ' kilometer(s)/hour',
			dataType: 'decimal'	
		},
		calories: {
			goalTypeId: '#goalCalories',
			goalTypeName: 'GoalCalories',		
			goalValue: null,
			strTitle: 'Calories',
			strTooltipSuffix: ' calories',
			dataType: 'decimal'											
		},
		daysLimit:{
			dataType: 'integer'
		}		 
	}


	var FIREBASE_URL="https://timetrackingapp.firebaseio.com/";
	
	//The whole root of firebase, will be then used in showGraph()
	var rootRef = new Firebase(FIREBASE_URL);

	//only today metrics
	FIREBASE_URL+=$scope.today;
	var todayRef = new Firebase(FIREBASE_URL)
	$scope.metrics = $firebase(todayRef);

	function returnZeroIfDataNotQualified(goalValue){ ///REPLACE -----------------------------LEGACY DETECTED
		if(!goalValue || isNaN(goalValue)==true || goalValue<0)
			goalValue= 0;
		if(goalValue>100)
			goalValue= 100;
		return goalValue;
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
	
	//graphObject which will be overwritten later in showGraph() function
    var graphObj ={
	    title: {
	        text: 'Oops, data is too shy to be ready. Please click Refresh for them to show off!',
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


	//Override some parts of graphObjc
	function showGraphHelper(numberOfViewedDays,datesArray,goalsArray,realMetricsArray,strTitle,strTooltipSuffix){
		graphObj.title.text= 'Last '+numberOfViewedDays+' days\' Statistics';
		graphObj.xAxis.categories=datesArray;
		graphObj.series[0].data=goalsArray;		    	
		graphObj.series[1].data=realMetricsArray;
		graphObj.yAxis.title.text=strTitle;
		graphObj.tooltip.valueSuffix=strTooltipSuffix;	
	}


	function populateDataIntoArrays(metricalType){

		$scope.numberOfViewedDays=filterInputForDayLimit($scope.numberOfViewedDays);
		var numberOfViewedDays=$scope.numberOfViewedDays;

		//Only get the latest 100 data
		limitedData=rootRef.endAt().limit(100); 

	  	limitedData.on('value', function(snapshot) {
		  	var refinedData = snapshot.val();
			$scope.datesArray=[];
			
			var goalsArray=[];
			var realMetricsArray=[];
			var finalDatesArray=[];

			var strTitle,strTooltipSuffix;
			function setTitleAndToolTip(metricalType){
				strTitle=typesTable[metricalType].strTitle; 
				strTooltipSuffix=typesTable[metricalType].strTooltipSuffix;
			}			

			//push value into array
			for (var key in refinedData) {
				var refinedDataWithKey= refinedData[key];
				/*if($scope.datesArray.length>=numberOfViewedDays){
					break; //it may not break here
				}else{	*/
					$scope.datesArray.push(refinedDataWithKey.DateString);
					if(metricalType=="steps"){
						realMetricsArray.push(parseInt(refinedDataWithKey.Steps));
						goalsArray.push(parseInt(filterInputForDataReceivedFromServer(refinedDataWithKey.GoalSteps)));
						setTitleAndToolTip(metricalType);
					}
					if(metricalType=="distance"){
						realMetricsArray.push(parseFloat(refinedDataWithKey.Distance));	
						goalsArray.push(parseFloat(filterInputForDataReceivedFromServer(refinedDataWithKey.GoalDistance)));
						setTitleAndToolTip(metricalType);													
					}
					if(metricalType=="pace"){
						realMetricsArray.push(parseInt(refinedDataWithKey.Pace));	
						goalsArray.push(parseInt(filterInputForDataReceivedFromServer(refinedDataWithKey.GoalPace)));
						setTitleAndToolTip(metricalType);												
					}
					if(metricalType=="speed"){
						realMetricsArray.push(parseFloat(refinedDataWithKey.Speed));	
						goalsArray.push(parseFloat(filterInputForDataReceivedFromServer(refinedDataWithKey.GoalSpeed)));
						setTitleAndToolTip(metricalType);													
					}
					if(metricalType=="calories"){
						realMetricsArray.push(parseInt(refinedDataWithKey.Calories));	
						goalsArray.push(parseFloat(filterInputForDataReceivedFromServer(refinedDataWithKey.GoalCalories)));
						setTitleAndToolTip(metricalType);												
					}			
				//}
			}
			
			finalRealMetricsArray=[];
			finalGoalsArray=[];	
			$scope.datesArray.reverse();		
			realMetricsArray.reverse();
			goalsArray.reverse();

			for(i=0;i<numberOfViewedDays;i++){
				finalDatesArray.push($scope.datesArray[i]);
				finalRealMetricsArray.push(realMetricsArray[i]);
				finalGoalsArray.push(goalsArray[i]);					
			}

			finalDatesArray.reverse();
			finalRealMetricsArray.reverse();
			finalGoalsArray.reverse();

			$(function () { showGraphHelper(numberOfViewedDays,finalDatesArray,finalGoalsArray,finalRealMetricsArray,strTitle,strTooltipSuffix); });	

		});	
	}


	$scope.showGraph=function(metricalType){
		populateDataIntoArrays(metricalType);//unable to see at first		
		$('#graphView').highcharts(graphObj);
		$scope.graphVisibility=true;
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
		if(typesTable[goalType].dataType=="integer" && !isPositiveInteger(value)){
			disallowInvalidInput();
		}
		return value;					
	}
	
	//populate values from $scope.metrics to typeTable
	function populateMetricsValuesToTypeTable(){
		typesTable.steps.goalValue=$scope.metrics.GoalSteps;
		typesTable.distance.goalValue=$scope.metrics.GoalDistance;	
		typesTable.pace.goalValue=$scope.metrics.GoalPace;
		typesTable.speed.goalValue=$scope.metrics.GoalSpeed;
		typesTable.calories.goalValue=$scope.metrics.GoalCalories;			
	}

	function showOrHideEditLabelsAndReturnUpdatedObject(goalType,booleanValue,value){
		if(goalType=="steps"){
			$scope.GoalStepsEdit= booleanValue;			
		}

		if(goalType=="distance"){
			$scope.GoalDistanceEdit= booleanValue; 					
		}		
		if(goalType=="pace"){			 
			$scope.GoalPaceEdit= booleanValue; 					
		}	
		if(goalType=="speed"){
			$scope.GoalSpeedEdit= booleanValue; 		
		}
		if(goalType=="calories"){
			$scope.GoalCaloriesEdit= booleanValue; 
		}

		updates={};
		updates[typesTable[goalType].goalTypeName]=value;
		return updates;	
	}
	
	$scope.onEditMode=function(editType){
		showOrHideEditLabelsAndReturnUpdatedObject(editType,true, null);
		var stringID=typesTable[editType].goalTypeId;
		//$(stringID).contenteditable=true;		
		$(stringID).focus();
	}

	$scope.submitChanges=function(goalType){

		populateMetricsValuesToTypeTable();

		var updatedGoal, updates;
		var stringId=typesTable[goalType].goalTypeId;
		var oldValue=typesTable[goalType].goalValue;
		value=filterInputForModifiedGoal(stringId,goalType,oldValue);
			
		$scope.metrics.$update(showOrHideEditLabelsAndReturnUpdatedObject(goalType,false,value));
	}

	$scope.cancel=function(goalType){
		
		populateMetricsValuesToTypeTable();

		var stringId=typesTable[goalType].goalTypeId;
		var oldValue=typesTable[goalType].goalValue;		
		$(stringId).html(oldValue);

		showOrHideEditLabelsAndReturnUpdatedObject(goalType,false, null);
	}

	/************************************************************ EXPORT TO JSON MODULE ************************************************************/
	//For premium user only



}