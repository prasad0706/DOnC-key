import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, ArrowUpTrayIcon, CloudArrowUpIcon, MagnifyingGlassIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const processingSteps = [
    { id: 1, label: "Upload", icon: CloudArrowUpIcon, description: "Transfer PDF to secure storage" },
    { id: 2, label: "Extract", icon: MagnifyingGlassIcon, description: "Parse document structure & content" },
    { id: 3, label: "Validate", icon: ShieldCheckIcon, description: "Verify data integrity & format" },
    { id: 4, label: "API Ready", icon: KeyIcon, description: "Generate programmable endpoints" },
];

const Upload = () => {
    const { theme } = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        // Simulate processing steps
        simulateProcessing();
    };

    const handleClick = () => {
        simulateProcessing();
    };

    const simulateProcessing = () => {
        setCurrentStep(1);
        let step = 1;
        const interval = setInterval(() => {
            step++;
            setCurrentStep(step);
            if (step >= 4) {
                clearInterval(interval);
                setTimeout(() => setCurrentStep(0), 3000);
            }
        }, 1500);
    };

    const getContainerClasses = () => {
        let classes = "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ";
        if (isDragging) {
            classes += theme === 'dark' ? "border-blue-500 bg-blue-500/10" : "border-blue-500 bg-blue-50/10";
        } else {
            classes += theme === 'dark' ? "border-gray-600 hover:border-blue-500/50 hover:bg-gray-700/30" : "border-gray-300 hover:border-blue-500/50 hover:bg-gray-50";
        }
        if (currentStep > 0) classes += " pointer-events-none";
        return classes;
    };

    const getIconContainerClasses = () => {
        let classes = "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ";
        if (isDragging) {
            classes += theme === 'dark' ? "bg-blue-500/10" : "bg-blue-500/10";
        } else {
            classes += theme === 'dark' ? "bg-gray-700" : "bg-gray-100";
        }
        return classes;
    };

    const getTextClasses = (type) => {
        if (type === 'primary') {
            return currentStep > 0 ? (theme === 'dark' ? "text-white" : "text-gray-900") : (theme === 'dark' ? "text-white" : "text-gray-900");
        } else {
            return theme === 'dark' ? "text-gray-400" : "text-gray-500";
        }
    };

    const getProgressBgClass = () => {
        return theme === 'dark' ? "bg-gray-700" : "bg-gray-100";
    };

    const getProgressFillClass = () => {
        return "h-full bg-blue-500 transition-all duration-500";
    };

    const getStepContainerClasses = (isComplete, isActive) => {
        let classes = "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 mb-3 ";
        if (isComplete) {
            classes += "bg-blue-500 text-white";
        } else {
            classes += theme === 'dark' ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500";
        }
        if (isActive) classes += " ring-4 ring-blue-500/20";
        return classes;
    };

    return (
        <div className="p-6">
            <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
                <h1 className="text-2xl font-bold">Upload Document</h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Upload a PDF to generate a programmable JSON API</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Upload Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    className={getContainerClasses()}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={getIconContainerClasses()}>
                            {currentStep > 0 ? (
                                <ArrowUpTrayIcon className="w-8 h-8 text-green-500" />
                            ) : (
                                <DocumentTextIcon
                                    className={isDragging ? "w-8 h-8 text-blue-500" : "w-8 h-8 text-gray-400"}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className={`text-base font-medium ${getTextClasses('primary')}`}>
                                {currentStep > 0
                                    ? "Processing your document..."
                                    : "Drop a PDF here or click to upload"}
                            </p>
                            <p className={getTextClasses('secondary')}>
                                Maximum file size: 500 pages
                            </p>
                        </div>

                        {currentStep === 0 && (
                            <button className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                <ArrowUpTrayIcon className="w-4 h-4" />
                                Select PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Processing Steps */}
                <div className={`border rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
                        Processing Pipeline
                    </h3>

                    <div className="relative">
                        {/* Progress Line */}
                        <div className={`absolute top-6 left-6 right-6 h-0.5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${Math.max(0, ((currentStep - 1) / 3) * 100)}%` }}
                            />
                        </div>

                        {/* Steps */}
                        <div className="relative grid grid-cols-4 gap-4">
                            {processingSteps.map((step) => {
                                const isComplete = currentStep >= step.id;
                                const isActive = currentStep === step.id;

                                return (
                                    <div key={step.id} className="flex flex-col items-center text-center">
                                        <div className={getStepContainerClasses(isComplete, isActive)}>
                                            {isComplete && !isActive ? (
                                                <ArrowUpTrayIcon className="w-5 h-5" />
                                            ) : (
                                                <step.icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <p
                                            className={`text-sm font-medium ${isComplete ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                                                }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className={theme === 'dark' ? 'text-xs text-gray-400 mt-1 hidden sm:block' : 'text-xs text-gray-500 mt-1 hidden sm:block'}>
                                            {step.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
