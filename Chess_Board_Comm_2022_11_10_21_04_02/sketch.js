let serial;
let portName = '/dev/tty.usbmodem2101';
let player1Data, player2Data;
let player1, player2;
let nameList = [ "Q", "K", "KN", "KN1", "P1", "P2", "P3", "P4"]

let player1Power, player2Power; //power tobe displayed;
function setup() {
  createCanvas(400, 300);

  initiatePhysicalPart();
  initiateGamePart();

  player1Data = "K";
  player2Data = "Q";
}

function draw() {
  // black background, white text:
  background(0);
  fill(255);
  // display the incoming serial data as a string:
  text("sensor value: " + player1Data, 30, 50);
}

// ========================Game Part==============================//

function initiateGamePart() {
  resetGame();
}

class Piece {
  constructor(name) {
    this.name = name;
    this.power;
  }
}

class Player {
  constructor() {
    this.pieces = {};
    this.populatePieces();
  }

  populatePieces() {
    for(let i =0; i< nameList.length; i++){
        let currentPiece = new Piece(nameList[i])
        if(currentPiece.name == "Pawn")
        currentPiece.power = randomInt(2)


        this.pieces[nameList[i]] = currentPiece
    }
  }
}

function randomInt(amount) {
  return int(random(amount))
}


function check(player1Data, player2Data) {
  player1Power = player1.pieces[player1Data];
  player2Power = player2.pieces[player2Data];

  return player1Power > player2Power ? 1 : 2
}


function keyPressed() {
  if (keyCode == 82) { //===press r to reset the game
    print("resetting game");
    resetGame();
  } else if (keyCode == 13) { //===press enter to compare power
    print("checking power");
    result = check(player1Data, player2Data)
    print(result)
  }
}

function resetGame() {
  player1 = new Player();
  player2 = new Player();
  print(player1.pieces)
}





// ======================Physical Part============================== //

function initiatePhysicalPart() {
  try {
    serial = new p5.SerialPort();
    serial.on('connected', serverConnected);
    serial.on('open', portOpen);
    serial.on('data', serialEvent);
    serial.on('error', serialError);
    serial.on('close', portClose);
    serial.open(portName);
  } catch (error) {

  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  let currentString = serial.readLine();
  trim(currentString);
  if (!currentString) return;
  console.log(currentString);
  player1Data = currentString;


}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}
