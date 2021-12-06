import {Move, ShortMove} from "chess.js";

export interface OpeningNode {
    items: OpeningNode[],
    id: string,
    text: string,
    moves: ShortMove[] | Move[],
    selected?: boolean
}