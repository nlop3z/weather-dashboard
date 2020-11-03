// DOM variables
var city="";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemp = $("#temperature");
var currentHumidty= $("#humidity");
var currentWindSpeed=$("#wind-speed");
var currentUvIndex= $("#uv-index");
var sCity=[];
// searches city to see if it exists in storage input
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//API key setup
var APIKey="1c61cac0defede7cfc0c5ddc2fc52007";
// shows current weather based on search input
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// AJAX call
function currentWeather(city){
    // URL to get data from server
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display current weather, city name, date and weather icon 
        console.log(response);
        //Dta object from server side Api for icon property.
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for city and concatinate the date and icon.
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        // parse the response to display the current temperature.
        
        // Convert temp to fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemp).html((tempF).toFixed(2)+"&#8457");
        // Humidity
        $(currentHumidty).html(response.main.humidity+"%");
        // Wind speed (convert -> MPH)
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWindSpeed).html(windsmph+"MPH");
        // UVIndex
        // Use app id and coordinates as parameter with geo coordinates method to build uv query url inside fx
        UvIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    // Returns the UVIindex response
function UvIndex(ln,lt){
    // Builds the url for uvindex
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvIndex).html(response.value);
            });
}
    
// 5 day forecast for current city
function forecast(cityid){
    var day= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

// Adds searched city to the search history section
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
// Displays the past search/city info when li clicked in search history section
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadLastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
// Clears search history
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
// Click handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadLastCity);
$("#clear-history").on("click",clearHistory);





















