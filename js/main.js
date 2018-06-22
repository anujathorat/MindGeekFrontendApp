var jsonDataRes = [];
var jsonDataSearch = [];
var urls = ["json/source1.json",
            "json/source2.json"];

function onPageLoad(){
	AjaxRequestsDiffer(urls, callbackDiff, callbackDiffFail);
}
function callbackDiff(data) {
	for (var index in data) {
		jsonDataRes =  jsonDataRes.concat(JSON.parse(data[index]));
	}
	console.log(jsonDataRes)
	loadData("initalDataLoad");
};
//callback function if one of AJAX requests fails.
function callbackDiffFail(url) {
	console.log(url + ' failed');
};
AjaxRequest = function(url, callback, callbackFail) {
	var xmlhttp;

	if (window.XMLHttpRequest)
		xmlhttp=new XMLHttpRequest();
	else
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200)
				callback(xmlhttp.responseText, url);
			else
				callbackFail(url);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
};

/* Different AJAX requests to get data and a single callback is called
	  after all AJAX requests are completed successfully.*/	 
AjaxRequestsDiffer = function(urls, callbackDiff, callbackDiffFail) {
	var isCallFail = false;
	var data = {};

	for (var i=0; i<urls.length; i++) {
		var callback = function(responseText, url) {
			if (isCallFail) return;

			data[url] = responseText;
			// get size of data
			var size = 0;
			for (var index in data) {
				if (data.hasOwnProperty(index))
					size ++;
			}

			if (size == urls.length)
				// all AJAX requests are completed successfully
				callbackDiff(data);
		};
		var callbackFail = function(url) {
			isCallFail = true;
			callbackDiffFail(url);
		};
		AjaxRequest(urls[i], callback, callbackFail);
	}
};

function loadData(event){
	var  inputVal = document.getElementById("searchInput").value;
	if(event == "initalDataLoad"){
		var jsonData = jsonDataRes.sort(function(a,b){
			return a.title > b.title;
		});		
	}
	else if(event == "newest"){
		var jsonData = (jsonDataSearch.length > 0 ||( jsonDataSearch.length == 0 && inputVal != ""))? jsonDataSearch:jsonDataRes;

		jsonData.sort(function(a,b){
			return new Date(a.posttime).getTime() < new Date(b.posttime).getTime();
		});
	}
	else if(event == "oldest"){
		var jsonData = (jsonDataSearch.length > 0 ||( jsonDataSearch.length == 0 && inputVal != ""))? jsonDataSearch:jsonDataRes;
		jsonData.sort(function(a,b){
			return new Date(a.posttime).getTime() > new Date(b.posttime).getTime();
		});			
	}
	else if(event == "rating"){				
		var jsonData = (jsonDataSearch.length > 0 ||( jsonDataSearch.length == 0 && inputVal != ""))? jsonDataSearch:jsonDataRes;
		jsonData.sort(function(a,b){
			return a.rating < b.rating;
		})
	}
	else if(event == "search"){				
		var jsonData = jsonDataSearch;
	}
	if(document.getElementById("mainDiv")){
		document.getElementById("mainDiv").innerHTML="";
	}
	var parentDiv = document.getElementById("mainDiv");			
	for(var i = 0; i < jsonData.length; i++){
		var obj = jsonData[i];

		var date = new Date(obj.posttime);
		var day = date.getDate();
		var month = date.getMonth()+1;
		var year = date.getFullYear();
		var timeHr = date.getHours();
		var timeMin = date.getMinutes();

		var htmlTemplate =      
			` <div id="videoTemp" class="videoBlock">
		<div id="title" class="titlecls">${obj.title}</div>
		<div class="thumbnailcls">
		<div class="ratingcls">
		<img class = "ratingImg" src="images/rating.png" height="15" width="15" >
		<span>${obj.rating}</span>
		</div>
		<video class ="thumbnailImg" controls preload="metadata">
		<source src=${obj.video_url} type="video/ogg">
		</video>				        		
		</div>
		<div id= ${"tagsDiv"+i} class="tagsDiv">   </div>
		<div id= "time" class="timeDiv">
		<span class="dateSpan">${day}-${month}-${year}</span>
		<span class="timeSpan">${timeHr}:${timeMin}</span>
		</div>
		</div>`;

		var temp = document.createElement('div'); 
		temp.innerHTML = htmlTemplate;
		parentDiv.appendChild(temp);

		for(var j=0;j<obj.tags.length;j++){
			var tags = document.createElement('span');
			tags.innerHTML = obj.tags[j];
			tags.className = "tags";
			var tagDiv = document.getElementById("tagsDiv"+i);
			tagDiv.appendChild(tags);
		}
	}	
}

function getNewData(){
	document.getElementById("newBtn").classList.add("btnactivecls");
	document.getElementById("oldBtn").classList.remove("btnactivecls");
	document.getElementById("rateBtn").classList.remove("btnactivecls");
	loadData("newest");
}
function getOldData(){
	document.getElementById("newBtn").classList.remove("btnactivecls");
	document.getElementById("oldBtn").classList.add("btnactivecls");
	document.getElementById("rateBtn").classList.remove("btnactivecls");
	loadData("oldest");
}
function getRate(){
	document.getElementById("newBtn").classList.remove("btnactivecls");
	document.getElementById("oldBtn").classList.remove("btnactivecls");
	document.getElementById("rateBtn").classList.add("btnactivecls");
	loadData("rating"); 
}
function searchCard(e){
	document.getElementById("newBtn").classList.remove("btnactivecls");
	document.getElementById("oldBtn").classList.remove("btnactivecls");
	document.getElementById("rateBtn").classList.remove("btnactivecls");
	if(e.keyCode == 13){
		var input, filterVal;		
		var searchArray = [];

		input = document.getElementById("searchInput");
		filterVal = input.value.toUpperCase();

		var jsonData = jsonDataRes;

		for (i = 0; i < jsonData.length; i++) {
			var objData = jsonData[i].title.toUpperCase();
			var objTags = jsonData[i].tags;

			var found = objTags.find(function(element) {
				var tagsSearch = element.toUpperCase();

				if(tagsSearch.search(filterVal) > -1){
					return true;
				}	
			});  
			if(objData.search(filterVal) > -1 || found != undefined ){
				searchArray.push(jsonData[i]);
			}
			else{
				console.log("String not found");
			}
		}
		jsonDataSearch = searchArray;
		loadData("search");
	}
}