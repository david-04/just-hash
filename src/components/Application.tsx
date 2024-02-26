import { Component, h } from "preact";
import { CalculationInfo } from "./CalculationInfo.js";
import { Header } from "./Header.js";
import { InputRow } from "./InputRow.jsx";
import { ResultRow } from "./ResultRow.js";

import "./Application.css";

//----------------------------------------------------------------------------------------------------------------------
// Properties and state
//----------------------------------------------------------------------------------------------------------------------

export interface ApplicationProps {}

interface ApplicationState {
    readonly lines: ReadonlyArray<string>;
}

//----------------------------------------------------------------------------------------------------------------------
// Component
//----------------------------------------------------------------------------------------------------------------------

export class Application extends Component<ApplicationProps, ApplicationState> {
    private inputRows: ReadonlyArray<InputRow> = [];

    //------------------------------------------------------------------------------------------------------------------
    // Initialization
    //------------------------------------------------------------------------------------------------------------------

    public constructor(props: ApplicationProps) {
        super(props);
        this.state = { lines: ["", ""] };
        this.onChange = this.onChange.bind(this);
        this.onMoveCursor = this.onMoveCursor.bind(this);
    }

    render() {
        const lines = [...this.state.lines];
        while (1 < lines.length && !lines[lines.length - 1]) {
            lines.length--;
        }
        return (
            <div class="Application">
                <Header />
                {this.renderInputRows()}
                <ResultRow lines={lines} />
                <CalculationInfo numberOfLines={lines.length} />
            </div>
        );
    }

    renderInputRows() {
        const inputRows = new Array<InputRow>();
        const result = this.state.lines.map((_, index) => (
            <InputRow
                key={index}
                index={index}
                isLast={index + 1 === this.state.lines.length}
                onChange={this.onChange}
                onMoveCursor={this.onMoveCursor}
                ref={(inputRow: InputRow) => inputRows.push(inputRow)}
            />
        ));
        this.inputRows = inputRows;
        return result;
    }

    //------------------------------------------------------------------------------------------------------------------
    // Event handlers
    //------------------------------------------------------------------------------------------------------------------

    onChange(index: number, newValue: string) {
        const lines = [...this.state.lines];
        lines[index] = newValue.trim();
        if (lines[lines.length - 1]) {
            lines.push("");
        } else {
            this.purge(2);
        }
        this.setState({ ...this.state, lines });
    }

    onMoveCursor(targetRow: number) {
        targetRow = Math.max(0, Math.min(targetRow, this.inputRows.length - 1));
        this.inputRows[targetRow]?.focus();
        if (targetRow === this.inputRows.length - 1) {
            this.setState({ ...this.state, lines: [...this.state.lines, ""] });
        } else {
            this.purge(targetRow + 2);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Internal functions
    //------------------------------------------------------------------------------------------------------------------

    purge(minLength: number) {
        const lines = [...this.state.lines];
        while (minLength < lines.length && !lines[lines.length - 1] && !lines[lines.length - 2]) {
            lines.length--;
        }
        this.setState({ ...this.state, lines });
    }
}
