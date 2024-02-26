import { Component, h } from "preact";

import { ITERATIONS } from "../calculate-hash";
import "./CalculationInfo.css";

//----------------------------------------------------------------------------------------------------------------------
// Properties and state
//----------------------------------------------------------------------------------------------------------------------

export interface CalculationInfoProperties {
    readonly numberOfLines: number;
}

export interface CalculationInfoState {
    readonly calculationRulesVisible: boolean;
}

//----------------------------------------------------------------------------------------------------------------------
// Component
//----------------------------------------------------------------------------------------------------------------------

export class CalculationInfo extends Component<CalculationInfoProperties, CalculationInfoState> {
    //
    //------------------------------------------------------------------------------------------------------------------
    // Initialization
    //------------------------------------------------------------------------------------------------------------------

    public constructor(props: CalculationInfoProperties) {
        super(props);
        this.onToggleCalculationRules = this.onToggleCalculationRules.bind(this);
        this.state = { calculationRulesVisible: false };
    }

    //------------------------------------------------------------------------------------------------------------------
    // Render
    //------------------------------------------------------------------------------------------------------------------

    render() {
        return (
            <div class="CalculationInfo">
                <div class="toggle">
                    <a onClick={this.onToggleCalculationRules}>
                        {this.state.calculationRulesVisible ? "Hide" : "Show"} calculation rules{" "}
                        {this.state.calculationRulesVisible ? "▲" : "▶"}
                    </a>
                </div>
                {this.renderCalculation()}
            </div>
        );
    }

    renderFormula() {
        const { numberOfLines } = this.props;
        if (1 === numberOfLines) {
            return this.renderSHA512(0);
        } else if (numberOfLines <= 3) {
            const segments = new Array<string>(numberOfLines).fill("").map((_, index) => this.renderSHA512(index));
            return this.renderSHA512(segments.join(" + "));
        } else {
            const segments = [this.renderSHA512(0), this.renderSHA512(1), "...", this.renderSHA512(numberOfLines - 1)];
            return this.renderSHA512(segments.join(" + "));
        }
    }

    renderSHA512(indexOrExpression: number | string) {
        const expression = "number" === typeof indexOrExpression ? `input-${indexOrExpression + 1}` : indexOrExpression;
        return `hash(${expression})`;
    }

    renderCalculation() {
        return (
            this.state.calculationRulesVisible && (
                <div class="rules">
                    <table>
                        <tr>
                            <td>result</td>
                            <td>=</td>
                            <td>{this.renderFormula()}</td>
                        </tr>
                        <tr>
                            <td>hash(input)</td>
                            <td>=</td>
                            <td>hash{ITERATIONS}(input)</td>
                        </tr>
                        <tr>
                            <td>hash{ITERATIONS}(input)</td>
                            <td>=</td>
                            <td>sha512(hash{ITERATIONS - 1}(input) + input)</td>
                        </tr>
                        <tr>
                            <td>hash{ITERATIONS - 1}(input)</td>
                            <td>=</td>
                            <td>sha512(hash{ITERATIONS - 2}(input) + input)</td>
                        </tr>
                        <tr class="ellipsis">
                            <td>[...]</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>hash2(input)</td>
                            <td>=</td>
                            <td>sha512(hash1(input) + input)</td>
                        </tr>
                        <tr>
                            <td>hash1(input)</td>
                            <td>=</td>
                            <td>sha512(input)</td>
                        </tr>
                    </table>
                </div>
            )
        );
    }

    //------------------------------------------------------------------------------------------------------------------
    // Event handlers
    //------------------------------------------------------------------------------------------------------------------

    onToggleCalculationRules() {
        this.setState({ ...this.state, calculationRulesVisible: !this.state.calculationRulesVisible });
    }
}
