import React from "react";

type ISlider = {
    changeColor: (color: string) => void;
}

interface IPalitreState {
    numOfSliders: number;
    sliderRefs: React.RefObject<ISlider>[];
}

export class Palitre extends React.Component<{}, IPalitreState> {

    state: IPalitreState = {
        numOfSliders: 3,
        sliderRefs: [React.createRef<ISlider>(), React.createRef<ISlider>(), React.createRef<ISlider>()]
    }

    changeToRed = () => {
        for (const sliderRef of this.state.sliderRefs) {
            if (!sliderRef.current) continue;
            sliderRef.current.changeColor("red");
        }
    }

    handleSliderAddition = () => {
        this.setState({
            numOfSliders: this.state.numOfSliders + 1,
            sliderRefs: [...this.state.sliderRefs, React.createRef<ISlider>()]
        })
    }

    render() {
        return (
            <div>
                {this.state.sliderRefs.map((e, i) => (
                    <ColorSlider ref={this.state.sliderRefs[i] as React.RefObject<ColorSlider>} />
                ))}
                <button onClick={this.changeToRed}>Change to red</button>
                <button onClick={this.handleSliderAddition}>Add slider</button>
            </div>
        )
    }
}

interface IState {
    color: string;
    sliderValue: number;
}

export class ColorSlider extends React.Component<{}, IState> implements ISlider {

    state: IState = {
        color: "#fff",
        sliderValue: 1,
    }
    
    changeColor = (newColor: string) => {
        this.setState({
            color: newColor,
        });
    }

    handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = +e.target.value;
        const r = Math.round(value * 255);
        this.setState({
            sliderValue: value,
            color: `rgb(${r}, ${r}, ${r})`,
        })
    }

    render() {
        console.log(this.state.sliderValue);
        return (
            <div>
                <div
                    style={{
                        background: this.state.color,
                        width: 30,
                        height: 30,
                        borderRadius: 5,
                        boxShadow: "rgba(0,0,0,0.4) 0 0 3px"
                    }}
                />
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.state.sliderValue}
                    onChange={this.handleSliderChange}
                />
            </div>
        )
    }
}
