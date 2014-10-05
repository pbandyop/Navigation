//This is the js file. This is in development version.

var wrapping_div = document.getElementById('one');
var wrapping_div_title = document.getElementById('three');
var wrapping_div = document.getElementById('one');
var count = 1;
var clicked_keyword = [];
var return_result;
var display_timestamp;
var clicked_timestamp;
var color = "green";

function toggle() {

	var ele = document.getElementById("leftRow3");
	var text = document.getElementById("displayText");
	if(ele.style.display == "block") {
    		ele.style.display = "none";
		text.innerHTML = "<b>Abstract: </b>"+document.getElementById("leftRow3").innerHTML.substr(0,75)+".......";
  	}
	else {
		ele.style.display = "block";
		text.innerHTML = "Hide abstract....";
	}
}


function getTimestamp(){
	var time = new Date();
    	var timestamp = time.getDate() + "-" + time.getMonth() + "-" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    return timestamp;
}

function hideLoading() {
	// other code can be placed here 
	document.getElementById("rightCol1").style.display = 'none'; 
	// other code can be placed here
}

function showLoading() {
	// other code can be placed here
	document.getElementById("rightCol1").style.display = 'block';
	// other code can be placed here
	console.log("Hi, I think I am executed")
}


window.onload = function ajaxFunction()
{

	var arg2 = this.innerText;
	clicked_timestamp = getTimestamp();
	var string = encodeURIComponent('+');
	var res = encodeURIComponent(arg2);

	console.log("Value of count is: " +count);
	//Intial handler when user just logs in the interface
	if(count === 1){
		arg2 = "Initial";
	}
	clicked_keyword.push(arg2);


	var i, j, temp, span, div,
	    c = wrapping_div.childNodes, 
	    l = c.length;

	

	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	var url = "newEditPortfolioInterfaceTest.php";
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	displayed_result = {"data_displayed" : return_result, "display_timestamp": display_timestamp, "keyword_clicked": arg2, "click_timestamp": clicked_timestamp};
	clicked_keyword_test = {"keywords": clicked_keyword, "display_details": displayed_result, "counter": count};

	//Start spinning circle to show loading page
	showLoading();

	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			//Stop spinning circle after page load
			hideLoading();

			console.log(xmlhttp.responseText);
			return_result = JSON.parse(xmlhttp.responseText);
			display_timestamp = getTimestamp();

			for (i=l-1; i>=0; i-- ) {
				wrapping_div.removeChild(c[i]);
			}


			//Display target article details
			if(count === 1){				
				document.getElementById("leftRow2").innerHTML = return_result.target_article_details.title;
				clicked_keyword.push(return_result.target_article_details.title);
				document.getElementById("leftRow3").innerHTML = return_result.target_article_details.abstract;

				document.getElementById("leftRow4").innerHTML = "Original Keyword: " +return_result.target_article_details.original_stemmed_keywords;
				console.log("Length of original keywords are: " +return_result.target_article_details.original_stemmed_keywords.length)
				console.log("Keywords are: " +return_result.target_article_details.keywords.keyword);
				document.getElementById("leftRow5").innerHTML = "Inserted Keyword: " +return_result.target_article_details.modified_stemmed_keywords;


				var sum_length = return_result.target_article_details.original_stemmed_keywords.length + return_result.target_article_details.modified_stemmed_keywords.length;
				console.log("Total sum of keywords is: " +sum_length);
				localStorage.setItem("displayed_keyword_length", sum_length);
				clicked_keyword.push(sum_length);

				for(i=0; i<=return_result.target_keywords.length-1; i++){
					clicked_keyword.push(return_result.target_keywords[i].keyword);
				}

				test_display_keywords = return_result.target_keywords.concat(return_result.keywords);
				//Display keywords
				for (i=0; i<test_display_keywords.length; i++) {
				span = document.createElement('span');
					if(i<localStorage.getItem("displayed_keyword_length")){					
						span.innerHTML = "<b><font color="+color+">"+test_display_keywords[i].keyword+"</font></b>";
					}
					else{
						span.innerHTML = test_display_keywords[i].keyword;
					}
				span.addEventListener('click', ajaxFunction);
				span.setAttribute("index", i);
				div = document.getElementById('one');
				div.appendChild(span);
				}

				//Display keyword scores
				document.getElementById("three").innerHTML = "";

				for (i=0;i<test_display_keywords.length;i++){
					if (i < localStorage.getItem("displayed_keyword_length")){
						document.getElementById("three").innerHTML += "<b><font color="+color+">"+test_display_keywords[i].score+"</font></b><br>";
						console.log("Scores that should be print in green:  " +test_display_keywords[i].score)
						if (!test_display_keywords[i].score){
							clicked_keyword.push(return_result.target_keywords[i].keyword)
							console.log("Score is null" + return_result.target_keywords[i].keyword);
						}
					}
					else{
						document.getElementById("three").innerHTML += test_display_keywords[i].score+"<br>"; 	
					}
				} 



				document.getElementById("two").innerHTML = "";
				//Display articles titles
				for (i=0;i<return_result.articles.length;i++){
					if(return_result.articles[i].title === clicked_keyword[1]){
						document.getElementById("two").innerHTML += "<b><font color="+color+">"+return_result.articles[i].title+"</font></b><br>"
					}
					else{
						document.getElementById("two").innerHTML += return_result.articles[i].title+"<br>";
					}
					
				}

				//Display articles scores
				document.getElementById("four").innerHTML = "";

				for (i=0;i<return_result.articles.length;i++){
					document.getElementById("four").innerHTML += return_result.articles[i].score+"<br>";
				}

				for (i=0;i<return_result.target_keywords.length;i++){
					//document.getElementById("two").innerHTML += return_result.articles[i].title+"<br>";
					console.log(return_result.target_keywords[i].keyword);
				}


				//Display rank of target article
				var color = "#FF0000";
				document.getElementById("LongCol2").innerHTML= "<b><font color="+color+">"+"Rank of displayed document is: "+return_result.target_article.rank+"</font></b>";
				document.getElementById("LongCol3").innerHTML= "<b><font color="+color+">"+"Diversity is: "+return_result.diversity+"</font></b>";
				console.log("Diversity is: "+return_result.diversity)

			}


			//Execute below displays only if user clicks a keyword
			if(count !== 1){

				test_display_keywords = return_result.target_keywords.concat(return_result.keywords);
			//Display keywords
				for (i=0; i<test_display_keywords.length; i++) {
				span = document.createElement('span');
					if(i<localStorage.getItem("displayed_keyword_length")){					
						span.innerHTML = "<b><font color="+color+">"+test_display_keywords[i].keyword+"</font></b>";
						console.log("Keywords that should be print in green:  " +test_display_keywords[i].keyword)
					}
					else{
						span.innerHTML = test_display_keywords[i].keyword;
					}

				span.addEventListener('click', ajaxFunction);
				span.setAttribute("index", i);
				div = document.getElementById('one');
				div.appendChild(span);
				}

				//Display keyword scores
				document.getElementById("three").innerHTML = "";

				for (i=0;i<test_display_keywords.length;i++){
					if (i < localStorage.getItem("displayed_keyword_length")){
						document.getElementById("three").innerHTML += "<b><font color="+color+">"+test_display_keywords[i].score+"</font></b><br>";
						console.log("Scores that should be print in green:  " +test_display_keywords[i].score)
					}
					else{
						document.getElementById("three").innerHTML += test_display_keywords[i].score+"<br>"; 	
					}
				}



				document.getElementById("two").innerHTML = "";
				//Display articles titles
				for (i=0;i<return_result.articles.length;i++){
					if(return_result.articles[i].title === clicked_keyword[1]){
						document.getElementById("two").innerHTML += "<b><font color="+color+">"+return_result.articles[i].title+"</font></b><br>"
					}
					else{
						document.getElementById("two").innerHTML += return_result.articles[i].title+"<br>";
					}
					
				}

				//Display articles scores
				document.getElementById("four").innerHTML = "";

				for (i=0;i<return_result.articles.length;i++){
					document.getElementById("four").innerHTML += return_result.articles[i].score+"<br>";
				}


				//Display rank of target article
				document.getElementById("LongCol2").innerHTML= "<b><font color="+color+">"+"Rank of displayed document is: "+return_result.target_article.rank+"</font></b>";
				document.getElementById("LongCol3").innerHTML= "<b><font color="+color+">"+"Diversity is: "+return_result.diversity+"</font></b>";
				console.log("Diversity is: "+return_result.diversity)
			}

			count = 0;

		}

	}
	
	//This is testing - 29.7.2014
	xmlhttp.send('myArray=' +encodeURIComponent(JSON.stringify(clicked_keyword_test)));
	
	console.log(encodeURIComponent(JSON.stringify(clicked_keyword)));
	console.log(JSON.stringify(clicked_keyword));


}

