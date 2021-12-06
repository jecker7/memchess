import React from 'react';
import {Button} from 'react-bootstrap';
import '../style-sheets/ControlPanel.scss'

export interface ControlPanelProps {
    switchColorsCallback: () => void,
    toggleArrowsCallback: () => void,
    uploadPGNsCallback: (uploadFile: React.RefObject<HTMLInputElement>) => void,
}

export class ControlPanel extends React.Component<ControlPanelProps> {
    private uploadFile: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
    render(): JSX.Element {
        return (
            <div className={"controlPanel"}>
                <Button className={"topButton"} variant={"primary"} onClick={this.props.switchColorsCallback}>Switch Color</Button>
                <Button className={"bottomButton"} variant={"secondary"} onClick={this.props.toggleArrowsCallback}>Toggle Arrows</Button>
                <input type="file"
                       multiple={true}
                       accept=".pgn"
                       ref={this.uploadFile}
                       hidden = {true}
                />
                <Button className={"bottomButton"} variant={"tertiary"} onClick={() => this.props.uploadPGNsCallback(this.uploadFile)}>Upload PGNs</Button>
            </div>
        );
    }
}