import React, {Component} from "react";
import Chessground from "react-chessground"
import "react-chessground/dist/styles/chessground.css"
import * as ChessJS from "chess.js"
import {ChessInstance, Move, ShortMove, Square} from "chess.js"
import * as Mover from "../helpers/Mover"
import '../style-sheets/OpeningDriller.scss'
import {OpeningTree} from "./OpeningTree";
import {drawArrow} from "../helpers/Drawer";
import {ControlPanel} from "./ControlPanel";
import Openings from "../data/openings.json";
import {OpeningNode} from "../data/OpeningNode";
import {MoveInput} from "../helpers/Mover";


const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

export interface OpeningDrillerState {
    orientation: string,
    loading: boolean,
    game: ChessInstance,
    pgn: string,
    moves: ShortMove[],
    shouldDraw: boolean
}

export class OpeningDriller extends Component<{}, OpeningDrillerState> {

    openings: OpeningNode[] = Openings as OpeningNode[]

    state = {
        orientation: "white",
        loading: true,
        game: new Chess(),
        pgn: "",
        moves: [],
        shouldDraw: true,
        currentMove: null
    };

    componentDidMount(): void {
        this.openings[0].selected = true;
        this.setState({loading: false, moves: this.openings[0].moves},
            () => {
            const moveSound = new Audio("sound/GenericNotify.mp3").play();
            this.computerMove(true)
            })
    }

    checkCapture(): boolean {
        // TODO: en passant capture case for short moves
        if(this.state.game.history().length <= 1){
            return false;
        } else {
            if(this.state.currentMove.captured
                || this.state.currentMove.toString().toLowerCase().includes("x") ){
                return true;
            } else if( this.state.currentMove.to
            == this.state.moves[this.state.game.history().length -1].to){
                return true;
            }
        }
    }

    onDrop = (sourceSquare: Square, targetSquare: Square): void => {
        this.state.currentMove = this.state.moves[this.state.game.history().length]
        const isCapture: boolean = this.checkCapture();
        const moveInput: MoveInput = {
            move: this.state.currentMove,
            game: this.state.game,
            callback: (game: ChessInstance) => {this.setState({game: game});},
            capture: isCapture,
            computerMove: false,
            expectedSourceSquare: sourceSquare,
            expectedTargetSquare: targetSquare
        }
        const playerMove = Mover.move(moveInput);
        if (!playerMove || this.resetIfEnd()) { return }
        this.computerMove(false)
    };

    computerMove(firstmove: boolean): void {
        //needed to draw first arrow when switching from black to white
        if (firstmove) { this.forceUpdate() }
        this.state.currentMove = this.state.moves[this.state.game.history().length]
        const capture: boolean = this.checkCapture();
        if (!firstmove || this.state.orientation === "black") {
            Mover.move({
                move: this.state.currentMove,
                game: this.state.game,
                callback: (game) => {this.setState({game: game})},
                computerMove: true,
                capture: capture,
            })
        }
        if (!firstmove) { this.resetIfEnd() }
    }

    switchColor = (): void => {
        let newOrientation = "white";
        if (this.state.orientation === "white") {
            newOrientation = "black"
        }
        this.setState({orientation: newOrientation, game: new Chess()}, () => this.computerMove(true));
    }

    resetIfEnd(): boolean {
        if (this.state.game.history().length < this.state.moves.length) {
            return false;
        }
        setTimeout(() => {
            this.setState({game: new Chess()}, () => {
                const moveSound = new Audio("sound/GenericNotify.mp3").play();
                this.computerMove(true)
            });
        }, 1000);
        return true;
    }

    changeMoves = (moves: ShortMove[]): void => {
        this.setState({
            moves: moves,
            game: new Chess()
        }, () => this.computerMove(true));
    }

    uploadPGNs = (fileInput: React.RefObject<HTMLInputElement>): void => {
        console.log("Uploaded file")
        // console.log(fileInput)
        fileInput.current.click();
        console.log(fileInput.current.files[0]);
        console.log(fileInput.current.files[0]);
        Array.from(fileInput.current.files).forEach(async (file) => {
            let opening: OpeningNode;
            const chess = new Chess();
            var pgn:string = await file.text();
            console.log(pgn)
            chess.load_pgn(pgn)
            // @ts-ignore
            opening = {
                items: null,
                id: "Custom Opening",
                text: file.name,
                moves: chess.moves({verbose: true}),
                selected: false
            };
            this.openings.push(opening);
        });
    }

    addUserPGNs = (event: Event): void => {
        console.log(event.target);
    }

    render(): JSX.Element {
        if (this.state.loading) return <h2>Loading...</h2>;
        return (
            <div className='sideBySide'>
                <OpeningTree
                    onClickCallback={this.changeMoves}
                    openings={this.openings}
                />
                <Chessground
                    fen={this.state.game.fen()}
                    onMove={this.onDrop}
                    orientation={this.state.orientation}
                    drawable={drawArrow(this.state)}
                />
                <ControlPanel
                    switchColorsCallback={this.switchColor}
                    toggleArrowsCallback={() => this.setState({shouldDraw: !this.state.shouldDraw})}
                    uploadPGNsCallback={this.uploadPGNs}
                />
            </div>
        )
    }
}

export default OpeningDriller