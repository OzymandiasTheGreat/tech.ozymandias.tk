import React, { useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { setOpacity, COLOR_SITE_BG, FONT_CODE, COLOR_GREEN } from "../theme";
import { randInt } from "../util/random";

function randChar(): string {
	if (randInt(0, 1)) {
		return String.fromCharCode(randInt(0x30a0, 0x30ff));
	}
	return String.fromCharCode(randInt(0x3040, 0x309f));
}

class SlowMatrixSymbol {
	canvas: HTMLCanvasElement;
	x: number;
	y: number;
	speed: number;
	opacity: number;
	char!: string;
	switchInterval = randInt(4, 24);

	constructor(
		canvas: HTMLCanvasElement,
		x: number,
		y: number,
		speed: number,
		opacity: number,
	) {
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.opacity = opacity;
	}

	get ctx(): CanvasRenderingContext2D {
		return this.canvas.getContext("2d") as any;
	}

	get width(): number {
		return this.canvas.width;
	}

	get height(): number {
		return this.canvas.height;
	}

	setToRandom(frames: number): void {
		if (frames % this.switchInterval === 0) {
			this.char = randChar();
		}
	}

	rain(): boolean {
		if (this.y > (this.height || 2560) + 50) {
			return true;
		}
		this.y += this.speed;
		return false;
	}
}

class SlowMatrixStream {
	canvas: HTMLCanvasElement;
	charSize: number;
	x: number;
	y: number;
	symbols: SlowMatrixSymbol[] = [];
	total = randInt(13, 32);
	speed = randInt(7, 18);

	constructor(canvas: HTMLCanvasElement, charSize: number) {
		this.canvas = canvas;
		this.charSize = charSize;
		this.x = randInt(0, this.width);
		this.y = randInt(-(this.height * 7), -(this.height / 2));
	}

	get ctx(): CanvasRenderingContext2D {
		return this.canvas.getContext("2d") as any;
	}

	get width(): number {
		return this.canvas.width;
	}

	get height(): number {
		return this.canvas.height;
	}

	generate(): void {
		let opacity = 1;
		for (let i = 0; i < this.total; i++) {
			const symbol = new SlowMatrixSymbol(
				this.canvas,
				this.x,
				this.y - i * this.charSize,
				this.speed,
				opacity,
			);
			symbol.setToRandom(0);
			this.symbols.push(symbol);
			opacity -= 1 / (this.total - 5);
		}
	}

	render(frames: number): void {
		if (
			this.symbols
				.map((symbol) => {
					this.ctx.fillStyle = setOpacity(
						COLOR_GREEN,
						symbol.opacity,
					);
					this.ctx.font = `${this.charSize}px "${FONT_CODE}", monospace`;
					this.ctx.fillText(symbol.char, symbol.x, symbol.y);
					symbol.setToRandom(frames);
					return symbol.rain();
				})
				.every((finished) => finished)
		) {
			this.x = randInt(0, this.width);
			this.symbols.forEach((symbol, index) => {
				symbol.x = this.x;
				symbol.y = this.y - index * this.charSize;
			});
		}
	}
}

class SlowMatrix {
	canvas: HTMLCanvasElement;
	streams: SlowMatrixStream[] = [];
	now = Date.now();
	frames = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		for (let i = 0; i <= 13; i++) {
			const stream = new SlowMatrixStream(this.canvas, randInt(13, 20));
			stream.generate();
			this.streams.push(stream);
		}
	}

	get ctx(): CanvasRenderingContext2D {
		return this.canvas.getContext("2d") as any;
	}

	get width(): number {
		return this.canvas.width;
	}

	get height(): number {
		return this.canvas.height;
	}

	draw(): void {
		if (Date.now() - this.now > 16) {
			this.ctx.fillStyle = COLOR_SITE_BG;
			this.ctx.fillRect(0, 0, this.width, this.height);
			this.streams.forEach((stream) => stream.render(this.frames));
			this.now = Date.now();
			this.frames++;
		}
		window.requestAnimationFrame(() => this.draw());
	}
}

const SlowMatrixBackground: React.FC = ({ children }) => {
	const canvas = useRef<HTMLCanvasElement>(null);
	const { width, height } = useWindowDimensions();
	const [matrix, setMatrix] = useState<SlowMatrix>();

	useEffect(() => {
		if (canvas.current) {
			canvas.current.width = width;
			canvas.current.height = height;
			if (!matrix) {
				const m = new SlowMatrix(canvas.current);
				m.draw();
				setMatrix(m);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [width, height]);

	return (
		<>
			<canvas
				ref={canvas}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					zIndex: -1000,
				}}></canvas>
			{children}
		</>
	);
};

export default SlowMatrixBackground;
