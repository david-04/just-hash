import { Component, h } from "preact";

import { calculateHash } from "../calculate-hash";
import "./ResultRow.css";

//----------------------------------------------------------------------------------------------------------------------
// Properties and state
//----------------------------------------------------------------------------------------------------------------------

export interface ResultRowProperties {
    readonly lines: ReadonlyArray<string>;
}

interface ResultRowState {
    readonly copyState: CopyState;
    readonly lines: ReadonlyArray<string>;
    readonly currentlyCalculatingLines: ReadonlyArray<string>;
    readonly hash: string | Error | undefined;
}

type CopyState = "idle" | "busy" | "success" | "failed";

//----------------------------------------------------------------------------------------------------------------------
// Component
//----------------------------------------------------------------------------------------------------------------------

export class ResultRow extends Component<ResultRowProperties, ResultRowState> {
    //
    //------------------------------------------------------------------------------------------------------------------
    // Initialization
    //------------------------------------------------------------------------------------------------------------------

    public constructor(props: ResultRowProperties) {
        super(props);
        this.onButtonClicked = this.onButtonClicked.bind(this);
        this.state = { copyState: "idle", lines: [], currentlyCalculatingLines: [], hash: undefined };
    }

    //------------------------------------------------------------------------------------------------------------------
    // Render
    //------------------------------------------------------------------------------------------------------------------

    render() {
        this.triggerHashCalculationIfNecessary();
        return (
            <div class="ResultRow">
                <button class={this.getButtonClass()} disabled={!this.canStartCopying()} onClick={this.onButtonClicked}>
                    {this.getButtonText()}
                </button>
                <div class="hash">{this.getHash()}</div>
            </div>
        );
    }

    getHash() {
        return this.linesAreCurrent(this.state.lines) ? `${this.state.hash}` : "Calculating...";
    }

    getButtonClass() {
        return this.state.copyState !== "idle" || this.canStartCopying() ? this.state.copyState : "busy";
    }

    getButtonText() {
        switch (this.state.copyState) {
            case "idle":
            case "busy":
                return "Copy";
            case "success":
                return "ok";
            case "failed":
                return "ERROR";
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Event handlers
    //------------------------------------------------------------------------------------------------------------------

    async onButtonClicked() {
        this.setState({ ...this.state, copyState: "busy" }, async () => {
            try {
                await navigator.clipboard.writeText(`${this.state.hash}`);
                this.flashButton("success");
            } catch (error) {
                console.error(error);
                this.flashButton("failed");
            }
        });
    }

    //------------------------------------------------------------------------------------------------------------------
    // Internal functions
    //------------------------------------------------------------------------------------------------------------------

    private canStartCopying() {
        return (
            "idle" === this.state.copyState &&
            "string" === typeof this.state.hash &&
            this.linesAreCurrent(this.state.lines)
        );
    }

    private triggerHashCalculationIfNecessary() {
        if (!this.linesAreCurrent(this.state.lines) && !this.linesAreCurrent(this.state.currentlyCalculatingLines)) {
            const lines = [...this.props.lines];
            this.setState({ ...this.state, currentlyCalculatingLines: lines }, () => {
                setTimeout(() => this.calculateHash(lines), 0);
            });
        }
    }

    private async calculateHash(lines: ReadonlyArray<string>) {
        try {
            const hash = await calculateHash(lines, () => this.assertLinesAreCurrent(lines));
            this.assertLinesAreCurrent(lines);
            this.setState({ ...this.state, lines, hash });
        } catch (error) {
            if (this.linesAreCurrent(lines)) {
                this.setState({
                    ...this.state,
                    lines,
                    hash: error instanceof Error ? error : new Error(`${error}`),
                });
            }
        }
    }

    private assertLinesAreCurrent(lines: ReadonlyArray<string>) {
        if (!this.linesAreCurrent(lines)) {
            throw new Error("Lines have changed");
        }
    }

    private linesAreCurrent(lines: ReadonlyArray<string>) {
        return (
            lines.length === this.props.lines.length && lines.every((value, index) => value === this.props.lines[index])
        );
    }

    private flashButton(copyState: "success" | "failed") {
        this.setState({ ...this.state, copyState }, () => {
            setTimeout(() => this.setState({ ...this.state, copyState: "idle" }), 500);
        });
    }
}
