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

	//Visibility
	$scope.graphVisibility=null;
	$scope.bulletsViewVisibility=null;
	$scope.instructionVisible = true;
	$scope.stepsTypeRefresh=false;
	$scope.distanceTypeRefresh=false;

	//Submit and Cancel bubttons for goalSet functionality are set invisible at first
	$scope.GoalStepsEdit= false;
	$scope.GoaldistanceEdit= false;
	$scope.GoalPaceEdit= false;
	$scope.GoalSpeedEdit= false;
	$scope.GoalCaloriesEdit= false;

	$scope.numberOfViewedDays = 10;

	$scope.stepsType = "steps";
	$scope.distanceType= "distance";
	$scope.paceType= "pace";
	$scope.speedType= "speed";
	$scope.caloriesType= "calories";

	//A types json obj containing information of each type of metrics
	//to access, for eg datatype, use typesTable[metricType].dataType
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
		}		 
	}


	var FIREBASE_URL="https://timetrackingapp.firebaseio.com/";
	
	//The whole root of firebase, will be then used in showGraph()
	var rootRef = new Firebase(FIREBASE_URL);

	//only today metrics
	FIREBASE_URL+=$scope.today;
	var todayRef = new Firebase(FIREBASE_URL)
	$scope.metrics = $firebase(todayRef);

	function returnZeroIfDataNotQualified(goalValue){
		if(!goalValue || isNaN(goalValue)==true || goalValue<0)
			goalValue= 0;
		if(goalValue>100)
			goalValue= 100;
		return goalValue;
	}

	$scope.metrics.GoalSteps=returnZeroIfDataNotQualified($scope.metrics.GoalSteps);
	$scope.metrics.GoalDistance=returnZeroIfDataNotQualified($scope.metrics.GoalDistance);
	$scope.metrics.GoalPace=returnZeroIfDataNotQualified($scope.metrics.GoalPace);
	$scope.metrics.GoalSpeed=returnZeroIfDataNotQualified($scope.metrics.GoalSpeed);
	$scope.metrics.GoalCalories=returnZeroIfDataNotQualified($scope.metrics.GoalCalories);

	//Partials Bulletview
	$scope.bulletsView="partials/index.html"; 
	$scope.showBulletView=function(){
		$scope.bulletsViewVisibility=true;
	}
	$scope.hideBulletView=function(){
		$scope.bulletsViewVisibility=false;
	}	
	/************************************************************ GRAPH MODULE ************************************************************/
	
	//jsonObject which will be overwritten later in showGraph() function
    var jsonObj ={
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


	//Override some parts of jsonObjc
	function showGraphHelper(numberOfViewedDays,datesArray,goalsArray,realMetricsArray,strTitle,strTooltipSuffix){
		jsonObj.title.text= 'Last '+numberOfViewedDays+' days\' Statistics';
		jsonObj.xAxis.categories=datesArray;
		jsonObj.series[0].data=goalsArray;		    	
		jsonObj.series[1].data=realMetricsArray;
		jsonObj.yAxis.title.text=strTitle;
		jsonObj.tooltip.valueSuffix=strTooltipSuffix;	
	}

//I lack of a validation system here! I will check back in the near future, this is just a quick patch
	function isNormalInteger(str) {
		return /^\+?(0|[1-9]\d*)$/.test(str);
	}

	function populateDataIntoArrays(metricalType){
		
		var numberOfViewedDays=returnZeroIfDataNotQualified($scope.numberOfViewedDays);
		if(numberOfViewedDays==0 || numberOfViewedDays==100){
			$scope.numberOfViewedDays=0;
			alert("Your input will be set to 0, please enter an valid number of days.");
		}
		if(!isNormalInteger(numberOfViewedDays)){
			numberOfViewedDays=0;
			$scope.numberOfViewedDays=0;
			alert("Your input will be set to 0, please enter an valid number of days.");
		}
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
						goalsArray.push(parseInt(returnZeroIfDataNotQualified(refinedDataWithKey.GoalSteps)));
						setTitleAndToolTip(metricalType);
					}
					if(metricalType=="distance"){
						realMetricsArray.push(parseFloat(refinedDataWithKey.Distance));	
						goalsArray.push(parseFloat(returnZeroIfDataNotQualified(refinedDataWithKey.GoalDistance)));
						setTitleAndToolTip(metricalType);													
					}
					if(metricalType=="pace"){
						realMetricsArray.push(parseInt(refinedDataWithKey.Pace));	
						goalsArray.push(parseInt(returnZeroIfDataNotQualified(refinedDataWithKey.GoalPace)));
						setTitleAndToolTip(metricalType);												
					}
					if(metricalType=="speed"){
						realMetricsArray.push(parseFloat(refinedDataWithKey.Speed));	
						goalsArray.push(parseFloat(returnZeroIfDataNotQualified(refinedDataWithKey.GoalSpeed)));
						setTitleAndToolTip(metricalType);													
					}
					if(metricalType=="calories"){
						realMetricsArray.push(parseInt(refinedDataWithKey.Calories));	
						goalsArray.push(parseInt(returnZeroIfDataNotQualified(refinedDataWithKey.GoalCalories)));	
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
		$('#graphView').highcharts(jsonObj);
		$scope.graphVisibility=true;
		$scope.currentType=metricalType;
	}

	/************************************************************ SET/MODIFY GOAL MODULE ************************************************************/
 	//Simple validation area
	//Check to see if updated value is NaN or <0 , if it is then get the old value of the model
	function returnUpdatedValue(goalType,stringId,oldValue){
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
		if(typesTable[goalType].dataType=="integer" && !isNormalInteger(value)){
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
		value=returnUpdatedValue(goalType,stringId,oldValue) //receive an update value if valid or old value if not
			
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