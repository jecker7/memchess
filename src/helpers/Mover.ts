import {ChessInstance, Move, ShortMove, Square} from "chess.js"
import {timer} from "rxjs";
import { take } from "rxjs/operators";

export interface MoveInput {
    move: Move | ShortMove,
    game: ChessInstance,
    callback: (game: ChessInstance) => void,
    capture: boolean,
    computerMove: boolean,
    expectedSourceSquare?: Square,
    expectedTargetSquare?: Square,
}

export function move(input: MoveInput): boolean {
    if (!validateInput(input)) {
        input.callback(input.game)
        return false
    }
    const validatedMove = input.move as Move
    let sound: string = input.capture ? "Capture.mp3" : "Move.mp3"
    if(input.computerMove){
        setTimeout(() => {
            makeMove(input, validatedMove, sound)
        }, 100)
    } else {
        makeMove(input, validatedMove, sound)
    }
    return true;
}

function makeMove(input: MoveInput, validatedMove: Move, sound: string){
    const moveSound = new Audio("sound/" + sound).play();
    input.game.move({
        from: validatedMove.from,
        to: validatedMove.to,
        promotion: "q" // always promote to a queen for example simplicity
    });
    input.callback(input.game)
}

function validateInput(input: MoveInput): boolean {
    return input.move != undefined && (!input.expectedSourceSquare
        || !input.expectedTargetSquare
        || (input.move.from === input.expectedSourceSquare
            && input.move.to === input.expectedTargetSquare))
}