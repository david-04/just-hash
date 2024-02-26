import { Component, h } from "preact";

import "./InputRow.css";

//----------------------------------------------------------------------------------------------------------------------
// Properties and state
//----------------------------------------------------------------------------------------------------------------------

export interface InputRowProps {
    readonly index: number;
    readonly isLast: boolean;
    readonly onChange: (index: number, newValue: string) => void;
    readonly onMoveCursor: (targetRow: number) => void;
}

//----------------------------------------------------------------------------------------------------------------------
// Component
//----------------------------------------------------------------------------------------------------------------------

export class InputRow extends Component<InputRowProps, never> {
    private previousValue = "";
    private inputField: HTMLInputElement | null = null;

    //------------------------------------------------------------------------------------------------------------------
    // Initialization
    //------------------------------------------------------------------------------------------------------------------

    public constructor() {
        super();
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onFocus = this.onFocus.bind(this);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Render
    //------------------------------------------------------------------------------------------------------------------

    render() {
        return (
            <div class={`InputRow ${this.props.isLast ? "last" : ""}`}>
                <input
                    type="password"
                    onInput={this.onChange}
                    onKeyDown={this.onKeyDown}
                    onFocus={this.onFocus}
                    ref={(element: HTMLInputElement | null) => {
                        this.inputField = element;
                    }}
                ></input>
            </div>
        );
    }

    //------------------------------------------------------------------------------------------------------------------
    // API
    //------------------------------------------------------------------------------------------------------------------

    focus() {
        const inputField = this.inputField;
        if (inputField) {
            inputField.focus();
            setTimeout(() => (inputField.selectionStart = inputField.selectionEnd = inputField.value.length), 0);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Event handlers
    //------------------------------------------------------------------------------------------------------------------

    onChange(event: InputEvent) {
        const currentValue = (event.target as HTMLInputElement).value.trim();
        if (currentValue !== this.previousValue) {
            this.props.onChange(this.props.index, currentValue);
            this.previousValue = currentValue;
        }
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowUp":
                this.props.onMoveCursor(this.props.index - 1);
                break;
            case "ArrowDown":
            case "Enter":
                this.props.onMoveCursor(this.props.index + 1);
                break;
        }
    }

    onFocus() {
        this.props.onMoveCursor(this.props.index);
    }
}
