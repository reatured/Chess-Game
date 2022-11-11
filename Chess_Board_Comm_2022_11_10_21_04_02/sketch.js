let serials = [];
let portNames = ['/dev/tty.usbmodem101','/dev/tty.usbmodem2101'];

let player1, player2;
let _pieceShortDic = {
  "King": "K",
  "Queen": "Q",
  "Knight": "KN",
  "Pawn": "P",
  "Rook": "R",
  "Bishop": "B"
};
let allPiecesDic = [];
//not important above^^^

//Arduino input to here: !!! @ potato
let data = [];
let player1Data, player2Data;

//Manipulatable variable:!!!! @ potato
//Number of each pieces:
let _pieceCountDic = {
  "King": 1,
  "Queen": 1,
  "Knight": 2,
  "Pawn": 4,
  "Rook": 0,
  "Bishop": 0
};

//What you need for arduino:!!!! @ potato
let player1Power = 0, player2Power = 0; //power tobe displayed;
let powerComparingResult;


function setup() {
  createCanvas(400, 300);

  initiatePhysicalPart();
  initiateGamePart();

  player1Data =  undefined;
  player2Data = undefined;
}

function draw() {
  // black background, white text:
  background(0);
  fill(255);
  // display the incoming serial data as a string:
  if(player1Data != undefined){
     text("sensor value: " + player1Data + " " + allPiecesDic[player1Data].type, 30, 50); 
  }
  if(player2Data != undefined){
      text("sensor value: " + player2Data + " " + allPiecesDic[player2Data].type, 30, 90);
  }
  text("Comparison: " + powerComparingResult, 30, 130);
}

// ========================Game Part==============================//

function initiateGamePart() {
  resetGame();
}

//No need to change
class Piece {
  constructor(type, i, player) {
    this.type = type;

    this.power = 0;
    this.playerID = player;

    this.name = player + _pieceShortDic[type] + i;
    allPiecesDic[this.name] = this;
  }
}

class Player {
  constructor(id) {
    this.pieces = [];
    this.playerID = id;
    this.populatePieces();
  }

  populatePieces() {
    for (var type in _pieceCountDic) {
      for (let i = 0; i < _pieceCountDic[type]; i++) {
        let currentPiece = new Piece(type, i, this.playerID)

        //change rules for power distribution here::::
        switch (type) {
          case "King":
            currentPiece.power = 1;
            break;
          case "Queen":
            currentPiece.power = 4;
            break;
          case "Knight":
            currentPiece.power = randomInt(2, 5);
            break;
          case "Pawn":
            currentPiece.power = randomInt(1, 3);
            break;

          default:
            break;
        }
        this.pieces.push(currentPiece)
      }
    }
  }
}



//return the result of comparison:
// result = 1: player1 win the capture
// result = 2: player2 win the capture
// result = -1: Tie
function check(player1Data, player2Data) {
  if(allPiecesDic[player1Data] == undefined){
    player1Power = 0;
  }else{
    player1Power = allPiecesDic[player1Data].power;
  }

  if(allPiecesDic[player2Data] == undefined){
    player2Power = 0;
  }else{
    player2Power = allPiecesDic[player2Data].power;
  }
  

  console.log("Player 1 Power: " + player1Power)
  console.log("Player 2 Power: " + player2Power)
  let result = player1Power > player2Power ? 1 : 2

  if (player1Power == player2Power) {
    result = -1
  }
  return result
}


//For
// 1. reset game
// 2. comparing power after pieces were put in places
function keyPressed() {
  if (keyCode == 82) { //===press r to reset the game
    console.log("resetting game");
    resetGame();
    serials[0].write(int(6) + '\n');
    serials[1].write(int(6) + '\n');
  } else if (keyCode == 13) { //===press enter to compare power
    console.log("checking power");
    powerComparingResult = check(player1Data, player2Data);
    console.log(powerComparingResult);
    // if(player1Power != 0 || player2Power != 0){
      serials[0].write(player1Power + '\n');
      serials[1].write(player1Power + '\n');
    // }
  }
}

//helper functions below;;
function resetGame() {
  player1 = new Player(1);
  player2 = new Player(2);
  console.log(allPiecesDic)
}
function randomInt(min, max) {
  return int(random(min, max))
}





// ======================Physical Part============================== //

function initiatePhysicalPart() {
  try {
    for(let i = 0; i < portNames.length; i++){
      let newPort = new p5.SerialPort();
      newPort.open(portNames[i]);
      newPort.on('connected', serverConnected);
      newPort.on('open', portOpen);
      newPort.on('data', serialEvent.bind(this, i));
      newPort.on('error', serialError);
      newPort.on('gotClose', portClose);
     
      serials.push(newPort);
    }
  } catch (error) {

  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent(index) {
  let currentString = serials[index].readLine();
  trim(currentString);
  if (!currentString) return;
  // console.log(currentString);
  data[index] = currentString;
  // console.log(data);
  
  // console.log("p1p " + player1Power);
  // console.log("p2p " + player2Power);

  serials[0].write(int(player1Power));
  serials[1].write(int(player2Power));
  assignData();
}

function sendData(){
}

function assignData(){
  if (data[0]  != undefined){
  player1Data = data[0];
  }
  if(data[1] != undefined){
  player2Data = data[1];
  }
  // console.log(player1Data, player2Data);
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}
