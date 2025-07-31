import {
	RiArrowRightSLine,
	RiHammerLine,
	RiPlayLine,
	RiTerminalLine,
} from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { SandpackOutput } from "@/components/room/output/SandpackOutput";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCodeExecutionHistory } from "@/query/realtime/execution.query";

export const CodeOutput = () => {
	return <SandpackOutput />;
};

export const _CodeOutput = () => {
	const { history } = useCodeExecutionHistory();
	const [openItems, setOpenItems] = useState<Map<number, boolean>>(new Map());
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new items are added
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop =
				scrollContainerRef.current.scrollHeight;
		}
	}, []);

	const toggleItem = (index: number) => {
		setOpenItems((prev) => {
			const newOpen = new Map(prev);
			const val = newOpen.get(index);
			newOpen.set(index, val === undefined ? false : !val);
			return newOpen;
		});
	};

	if (!history.length) {
		return (
			<div className="h-full w-full bg-white text-gray-800 font-mono">
				<div className="p-6 h-full overflow-auto">
					<div className="flex items-center justify-center h-full">
						<div className="text-center max-w-sm">
							<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
								<RiTerminalLine className="text-gray-400 size-6" />
							</div>
							<h3 className="text-sm font-medium text-gray-900 mb-2">
								No output yet
							</h3>
							<p className="text-sm text-gray-500 leading-relaxed">
								Run your code to see the execution results and output here
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full bg-white text-gray-800 font-mono">
			<div ref={scrollContainerRef} className="h-full overflow-auto">
				{history.map((data, idx) => {
					const hasOutput = data.stdout && data.stdout.trim() !== "";
					const hasError = data.stderr && data.stderr.trim() !== "";
					// if never opened or has been opened
					const isOpen = !openItems.has(idx) || openItems.get(idx) === true;
					const executionNumber = idx + 1; // Latest is at the bottom

					return (
						<Collapsible
							key={`${data.timestamp}-${idx}`}
							open={isOpen}
							onOpenChange={() => toggleItem(idx)}
						>
							<CollapsibleTrigger className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group text-gray-500 text-xs">
								<div className="flex items-center gap-3">
									<span
										className={cn(
											"transform transition-transform duration-200",
											isOpen ? "rotate-90" : "rotate-0",
										)}
									>
										<RiArrowRightSLine />
									</span>
									<div className="flex items-center gap-2">
										<span className="text-gray-600">
											Execution #{executionNumber}
										</span>
										<span className="text-gray-400">
											{new Date(data.timestamp).toLocaleTimeString()}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{data.compileTime && (
										<Tooltip content="Compilation time">
											<span className="text-gray-400 flex items-center gap-0.5">
												<RiHammerLine className="size-3" />
												{data.compileTime}ms
											</span>
										</Tooltip>
									)}
									{data.elapsedTime >= 0 && (
										<Tooltip content="Execution time">
											<span className="text-gray-400 flex items-center gap-0.5">
												<RiPlayLine className="size-3" />
												{data.elapsedTime}ms
											</span>
										</Tooltip>
									)}
								</div>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<div className="px-4 pb-2 space-y-1">
									{hasOutput && (
										<pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap break-words leading-relaxed">
											{data.stdout}
										</pre>
									)}
									{hasError && (
										<pre className="text-sm text-red-600 font-mono whitespace-pre-wrap break-words leading-relaxed">
											Error: {data.stderr}
										</pre>
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					);
				})}
			</div>
		</div>
	);
};
