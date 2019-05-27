import React from 'react';
import PropTypes from 'prop-types';
import { forgeClassHelper } from '@athena/forge/build/js/html/classes.js';
import { ForgeIcons } from '@athena/forge';
import { runInThisContext } from 'vm';

//This creates the non-interactive version of stepper. Set the 
//selectedIndex to the current step. Design assumption is that progress is
//only forward. Steps become unchecked again if selectedIndex decremented.

//A navigable stepper can have an arbitrary number of steps be represented
//as links that can be used to jump to previously completed steps non-
//sequentially. Assign an array of step index values to the created prop
//to indicate which steps to turn into links.
//onClick return an object describing the step clicked in the format:
//{ index:3, step: "4", label: "Sign Documents" }
//The navigable stepper that allows users to click on the steps to navigate the
//workflow progression has not been thoroughly explored beyond design concepts.
class Stepper extends React.Component {

	getWidthConstraints() {
		//Remove maxWidth inline style to have it fill 100% of container
		//Setting maxWidth here has the advantage of not having to add a parent
		//container to limit width. Set a stupidly large value to have it be 
		//fully fluid.
		//minWidth not settable from props for safeguard
		const minWidth = this.props.options.length * 96;
		let max = this.props.maxWidth;
		//Give a reasonable max width if not specified
		if (max == undefined || max < 1) {
			max = this.props.options.length * 128;
		}
		const maxWidth = this.props.options.length * (max / this.props.options.length);
		return ({
			minWidth: minWidth,
			maxWidth: maxWidth
		});
	}

	//Creates the HTML for a step ball and the description underneath
	//TODO: Substitute unicode checkmark with SVG
	createStep(idx) {
		return (
			<div>
				<div className="fe_c_stepper__ball">
					<span className="fe_c_stepper__ball-label">
						{/* Place a check if the step is before the selectedIndex
							In navigable version, also allow checks for steps 
							beyond the selectedIndex because the user can go
							back/forth amongst the completed steps. In all
							cases make the selectedIndex a number. */}
						{((idx < this.props.selectedIndex) ||
							(this.props.completed.find(x => x == idx) !== undefined && idx !== this.props.selectedIndex)) ?
							"\u2713" : this.props.options[idx].step
						}
					</span>
				</div>
				<span className="fe_c_stepper__description">
					{this.props.options[idx].label}
				</span>
			</div>
		);
	}

	render() {
		let keyId = 100;
		let steps = [];		
		let navigable = (this.props.completed !== undefined && this.props.completed.length > 0);
		for (let i = 0; i < this.props.options.length; i++) {
			if (navigable) {
				steps.push(
					<div key={keyId++} className={(i == this.props.selectedIndex) ? "fe_c_stepper__step--selected" : "fe_c_stepper__step"}>
						{
							(this.props.completed.find(x => x == i) !== undefined) ?
								<a className="fe_c_stepper__link"
									onClick={() => this.props.onStepClick({ index: i, ...this.props.options[i] })}>
									{this.createStep(i)}
								</a>
								: this.createStep(i)
						}
					</div>
				);
			}
			else {
				steps.push(
					<div key={keyId++} className={(i == this.props.selectedIndex) ? "fe_c_stepper__step--selected" : "fe_c_stepper__step"}>
						{this.createStep(i)}
					</div>
				);
			}
			if (i < this.props.options.length - 1) {
				steps.push(<div key={keyId++} className="fe_c_stepper__line" />);
			}
		}
		return (
			<div className={(navigable) ? "fe_c_stepper--navigable" :"fe_c_stepper"} style={this.getWidthConstraints()}>
				<div className="fe_c_stepper__step-row">
					{steps}
				</div>
			</div>
		);
	}
}

export default Stepper;