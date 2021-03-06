var config = {
    apiKey: "AIzaSyCwYXl_DCMGIIbbsVKrQyUCOXT9MHJkSRo",
    authDomain: "tinman-7c7f5.firebaseapp.com",
    databaseURL: "https://tinman-7c7f5.firebaseio.com",
    projectId: "tinman-7c7f5",
    storageBucket: "tinman-7c7f5.appspot.com",
    messagingSenderId: "446085058681"
};
 
firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// Initial Values
var yourPlayer = "";
var opponentPlayer ="";
var playerName = "";
var player1Name = "";
var player2Name = "";
var currentTurn = "";
var choicePicked = "";
var localWins =0;
var localLoses =0;
var rpsArray=[["Tie","Lose","Win"],
				["Win","Tie","Lose"],
				["Lose","Win","Tie"]];
var choiceNumber=["Rock","Paper","Scissors"];
var result ="";

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var localChat=null;

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  	// If they are connected..
    if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();

/*    if(yourPlayer=="1"){
    	alert("hi")
    	database.ref("/players/1/name").onDisconnect().set(null);
	    database.ref("/players/1/choice").onDisconnect().set(null);
	    database.ref("/players/1/loses").onDisconnect().set(0);
	    database.ref("/players/1/wins").onDisconnect().set(0);
	    database.ref("/players/2/choice").onDisconnect().set(null);
	    database.ref("/players/2/choice").onDisconnect().set(null);
	    var chat= snapshot.val().chatContent
	    if(true){
	    	chat = chat + "<p>" +snapshot.child("players").child("1").val().name+" disconnected!</p>"
	    	database.ref().update({
	 			chatContent: chat,	
			});
	    }
    }
    else if(yourPlayer=="2"){
    	database.ref("/players/2/name").onDisconnect().set(null);
	    database.ref("/players/2/choice").onDisconnect().set(null);
	    database.ref("/players/2/loses").onDisconnect().set(0);
	    database.ref("/players/2/wins").onDisconnect().set(0);
	    database.ref("/players/1/choice").onDisconnect().set(null);
	    if(true){
	    	chat = chat + "<p>"+ snapshot.child("players").child("2").val().name+" disconnected!</p>"
	    	database.ref().update({
	 			chatContent: chat,	
			});
	    }
    }
    else{
    	database.ref().update({
	 		chatContent: null,	
		});
    };*/
    database.ref("/players/1").update({
    	name:null,
    	choice:null,
    });
    database.ref("/players/2").update({
    	name:null,
    	choice:null,
    });

    database.ref().update({
	 	chatContent: null,	
	});
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#connected-viewers").html(snap.numChildren());
});

//When database value changes
database.ref().on("value", function(snapshot) {

	//Check to see if player1 exists - if not create
  	if (!snapshot.child("players").child("1").exists()) {
	    database.ref("/players/1").update({
	 		choice: null,
	 		loses: 0,
	 		name: null,
	 		wins:0
		})
		//Locally set player1Name to empty
		player1Name = "";
   	}
   	else{
   		//If player1 exists check if player1 has name
   		if (snapshot.child("players").child("1").val().name!=null){
   			//If so save player1Name locally
   			player1Name = snapshot.child("players").child("1").val().name;
   			$("#player1Name").html(player1Name);
   			//If your name is the same as player 1 name then you are player 1
   			if(player1Name==playerName&& playerName!=""){
   				yourPlayer="1";
	   			opponentPlayer="2";
	   			$("#name-form").html("Hi "+playerName+" ! You are player "+yourPlayer);
   			}
   		}
   	};

   	//Do the same for player2 as above
   	if(!snapshot.child("players").child("2").exists()) {
	    database.ref("/players/2").update({
	 		choice: null,
	 		loses: 0,
	 		name: null,
	 		wins:0
		})
		player2Name = "";
   	}
   	else{
   		if (snapshot.child("players").child("2").val().name!=null){
   			player2Name = snapshot.child("players").child("2").val().name;
	   		$("#player2Name").html(player2Name);
   			if(player2Name==playerName&& playerName!=""){
   				yourPlayer="2";
	   			opponentPlayer="1";
	   			$("#name-form").html("Hi "+playerName+" ! You are player "+yourPlayer);
	   		}		
   		};
   	}	

   	//Initialize turn 1
   	if(!snapshot.child("turn").exists()) {
	    database.ref().update({
	 		turn: 1,
		})   	
	}
	currentTurn=snapshot.val().turn;

	if(playerName!=""&&(playerName==player1Name||playerName==player2Name)){
		$("#turnDiv").html("Waiting for player "+opponentPlayer);
	};

   	if (currentTurn ==1&&player1Name!=""&&player2Name!=""){
		$("#player1").addClass("yellowBorder");
		$("#player2").removeClass("yellowBorder");
		if(yourPlayer=="1"){
			$("#turnDiv").html("It's your turn!");
			$("#player"+yourPlayer+"Choice").removeClass("displayNone");
		}
		else if(yourPlayer=="2"){
			$("#turnDiv").html("Waiting for player "+opponentPlayer+" to choose!");
			$("#player"+yourPlayer+"Choice").addClass("displayNone");
		}
	}
	else if(currentTurn ==2&&player1Name!=""&&player2Name!=""){
		$("#player2").addClass("yellowBorder");
		$("#player1").removeClass("yellowBorder");
		if(yourPlayer=="2"){
			$("#turnDiv").html("It's your turn!");
			$("#player"+yourPlayer+"Choice").removeClass("displayNone");
		}
		else if(yourPlayer=="1"){
			$("#turnDiv").html("Waiting for player "+opponentPlayer+" to choose!");
			$("#player"+yourPlayer+"Choice").addClass("displayNone");
		}
	};

	if (currentTurn==3){
		$("#player2").removeClass("yellowBorder");
		$("#player2Choice").addClass("displayNone");
		var x = snapshot.child("players").child("1").val().choice;
		var y = snapshot.child("players").child("2").val().choice;
		determineWinner(x,y);
		if(yourPlayer=="1"){	
			database.ref().update({
			 	turn: 4,
			})
			if(result=="Win"){
				var newWin1 = parseInt(snapshot.child("players").child("1").val().wins)+1
				database.ref("players/1").update({
		 			wins: newWin1,
				});  
				var newLose2= parseInt(snapshot.child("players").child("2").val().loses)+1
				database.ref("players/2").update({
		 			loses: newLose2,
				});
				$("#results").html("You Won!");
			}
			else if(result=="Lose"){
				var newWin2 = parseInt(snapshot.child("players").child("2").val().wins)+1
				database.ref("players/2").update({
		 			wins: newWin2,
				});
				var newLose1= parseInt(snapshot.child("players").child("1").val().loses)+1  
				database.ref("players/1").update({
		 			loses: newLose1,
				});
				$("#results").html("You lost!");
			}
			else if(result=="Tie"){
				$("#results").html("Tie!");
			};
		}
		if(yourPlayer=="2"){
			if(result=="Win"){
				$("#results").html("You Lost!");
			}
			else if(result=="Lose"){
				$("#results").html("You Won!");
			}
			else if(result=="Tie"){
				$("#results").html("Tie!");
			};
		}
		$("#choice1Picked").html(snapshot.child("players").child("1").val().choice);
		$("#choice2Picked").html(snapshot.child("players").child("2").val().choice);
	};

  
   	currentTurn=snapshot.val().turn;
   	if(yourPlayer=="1"){
   		localWins = snapshot.child("players").child("1").val().wins;
   		localLoses = snapshot.child("players").child("1").val().loses;
   	}
   	else if(yourPlayer=="2"){
   		localWins = snapshot.child("players").child("2").val().wins;
   		localLoses = snapshot.child("players").child("2").val().loses;
   	}
   	$("#player1Score").html("Wins: "+snapshot.child("players").child("1").val().wins+" Loses: "+snapshot.child("players").child("1").val().loses)
   	$("#player2Score").html("Wins: "+snapshot.child("players").child("2").val().wins+" Loses: "+snapshot.child("players").child("2").val().loses)

   	if (currentTurn==4){
   		setTimeout(function(){
   			database.ref().update({
			 	turn: 1,
			});
			$("#results").html("");
			$("#choice1Picked").html("");
			$("#choice2Picked").html("");
   		},5000)
   	}


   	if(!snapshot.child("chatContent").exists()){
   		database.ref().update({
	 		chatContent: null,	
		});
   	}
   	else if(snapshot.val().chatContent!=null){
   		localChat = snapshot.val().chatContent;
		$("#chatroom").html(localChat);	
   	};

   	/*//Re-initialize the data for your player if the other player disconnected.
   	if(yourPlayer!=""){
   		database.ref("/players/"+yourPlayer+"/").update({
		 	wins: 0,
		 	loses: 0	
		});
		database.ref("/players/"+opponentPlayer+"/").update({
		 	wins: 0,
		 	loses: 0	
		});
	   	database.ref("/players/"+yourPlayer+"/").update({
		 	name: playerName,
		 	wins: localWins,
		 	loses: localLoses	
		});
		if(yourPlayer=="1"){
	   		localWins = snapshot.child("players").child("1").val().wins;
	   		localLoses = snapshot.child("players").child("1").val().loses;
	   	}
	   	else if(yourPlayer=="2"){
	   		localWins = snapshot.child("players").child("2").val().wins;
	   		localLoses = snapshot.child("players").child("2").val().loses;
	   	}
   	}*/

  // If any errors are experienced, log them to console.
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});


//When start button click, save name into playerName locally and set it to player1Name if player1Name is empty. Set it to player2Name if player2Name is empty. Otherwise you are a spectator.
$( document ).ready(function() {
	$("#nameButton").on("click",function(event){
		event.preventDefault();
		playerName = $("#name-input").val().trim();
		if(player1Name==""){
			database.ref("/players/1").update({
	 			name: playerName,	
			})	
		}
		else if(player2Name==""){
			database.ref("/players/2").update({
	 			name: playerName,	
			})	
		}
		else{
			alert("you can only observe the game")
		};
	});
	$(document).on("click",".choiceButton",function(){
		choicePicked = $(this).attr("id");
		database.ref("/players/"+yourPlayer).update({
	 		choice: choicePicked,	
		});
		if(yourPlayer==1){
			database.ref().update({
		 		turn: 2,
			})  
		}
		else if(yourPlayer==2){
			database.ref().update({
		 		turn: 3,
			})
		}

	})
	$(document).on("click","#chatButton",function(){
		event.preventDefault();
		var chatMessage = $("#chat-input").val().trim();
		if(localChat!=null){
			localChat= localChat + "<p>"+playerName+": "+chatMessage+"</p>";
		}
		else{
			localChat= "<p>"+playerName+": "+chatMessage+"</p>";
		}
		database.ref().update({
	 		chatContent: localChat,	
		});
		$("#chat-input").val("");
	})

})

function determineWinner(x,y){
	var i = choiceNumber.indexOf(x);
	var y = choiceNumber.indexOf(y);
	result = rpsArray[i][y];
};

