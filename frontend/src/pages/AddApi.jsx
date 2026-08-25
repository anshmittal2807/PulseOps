import { useState } from "react";
import { useNavigate } from "react-router-dom";

const inputClasses =
    "bg-background border border-surface-border rounded text-on-surface px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full";
const selectWrapperClasses = "relative";
const chevronClasses =
    "material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]";

function AddApi() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [method, setMethod] = useState("GET");
    const [environment, setEnvironment] = useState("Production");
    const [description, setDescription] = useState("");
    const [statusCode, setStatusCode] = useState(200);
    const [responseTime, setResponseTime] = useState(500);
    const [interval, setIntervalValue] = useState("5");
    const [authType, setAuthType] = useState("None");
    const [requestBody, setRequestBody] = useState("");
    const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
    const [tags, setTags] = useState(["core-service", "auth"]);
    const [tagInput, setTagInput] = useState("");

    const addHeader = () => {
        setHeaders([...headers, { key: "", value: "" }]);
    };

    const updateHeader = (index, field, value) => {
        const updated = headers.map((header, i) =>
            i === index ? { ...header, [field]: value } : header
        );
        setHeaders(updated);
    };

    const removeHeader = (index) => {
        setHeaders(headers.filter((_, i) => i !== index));
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setTagInput("");
    };

    const removeTag = (tag) => {
        setTags(tags.filter((item) => item !== tag));
    };

    const handleSave = (event) => {
        event.preventDefault();
        console.log("Saving API:", { name, url, method, environment, description, statusCode, responseTime, interval, authType, headers, requestBody, tags });
        navigate("/apis");
    };

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-headline text-2xl font-semibold text-on-surface mb-1">Add New API Endpoint</h1>
                        <p className="text-on-surface-variant text-sm">Configure a new API target for real-time observability monitoring.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="bg-surface border border-surface-border rounded-[10px] p-5 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="apiName" className="text-sm text-on-surface-variant font-medium">API Name</label>
                            <input
                                id="apiName"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="e.g., User Authentication Service"
                                className={inputClasses}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="apiUrl" className="text-sm text-on-surface-variant font-medium">API URL</label>
                            <input
                                id="apiUrl"
                                type="url"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                placeholder="https://api.example.com/v1/auth"
                                className={`${inputClasses} font-mono`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="httpMethod" className="text-sm text-on-surface-variant font-medium">HTTP Method</label>
                            <div className={selectWrapperClasses}>
                                <select
                                    id="httpMethod"
                                    value={method}
                                    onChange={(event) => setMethod(event.target.value)}
                                    className={`${inputClasses} font-mono appearance-none cursor-pointer`}
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="PATCH">PATCH</option>
                                </select>
                                <span className={chevronClasses}>expand_more</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="environment" className="text-sm text-on-surface-variant font-medium">Environment</label>
                            <div className={selectWrapperClasses}>
                                <select
                                    id="environment"
                                    value={environment}
                                    onChange={(event) => setEnvironment(event.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="Production">Production</option>
                                    <option value="Staging">Staging</option>
                                    <option value="Development">Development</option>
                                </select>
                                <span className={chevronClasses}>expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm text-on-surface-variant font-medium">Description</label>
                        <textarea
                            id="description"
                            rows="2"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Briefly describe the purpose of this endpoint..."
                            className={`${inputClasses} resize-y`}
                        ></textarea>
                    </div>

                    <div className="border-t border-surface-border my-2"></div>

                    <h3 className="font-headline text-lg font-semibold text-on-surface mb-[-8px]">Health Criteria</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="statusCode" className="text-sm text-on-surface-variant font-medium">Expected Status Code</label>
                            <input
                                id="statusCode"
                                type="number"
                                value={statusCode}
                                onChange={(event) => setStatusCode(Number(event.target.value))}
                                className={`${inputClasses} font-mono`}
                            />
                        <div className="flex flex-col gap-2">
                            <label htmlFor="responseTime" className="text-sm text-on-surface-variant font-medium">Response Time Threshold (ms)</label>
                            <input
                                id="responseTime"
                                type="number"
                                value={responseTime}
                                onChange={(event) => setResponseTime(Number(event.target.value))}
                                className={`${inputClasses} font-mono`}
                            />
                        </div>

                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="interval" className="text-sm text-on-surface-variant font-medium">Monitoring Interval</label>
                            <div className={selectWrapperClasses}>
                                <select
                                    id="interval"
                                    value={interval}
                                    onChange={(event) => setIntervalValue(event.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="1">1 min</option>
                                    <option value="5">5 mins</option>
                                    <option value="15">15 mins</option>
                                    <option value="30">30 mins</option>
                                </select>
                                <span className={chevronClasses}>expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-surface-border my-2"></div>

                    <h3 className="font-headline text-lg font-semibold text-on-surface mb-[-8px]">Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="authType" className="text-sm text-on-surface-variant font-medium">Authentication Type</label>
                            <div className={selectWrapperClasses}>
                                <select
                                    id="authType"
                                    value={authType}
                                    onChange={(event) => setAuthType(event.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="None">None</option>
                                    <option value="Bearer">Bearer Token</option>
                                    <option value="APIKey">API Key</option>
                                    <option value="Basic">Basic Auth</option>
                                </select>
                                <span className={chevronClasses}>expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-surface-border my-2"></div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-headline text-lg font-semibold text-on-surface">Headers</h3>
                            <button
                                type="button"
                                onClick={addHeader}
                                className="text-primary hover:text-[#1adec5] transition-colors flex items-center gap-1 text-sm"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Add Header
                            </button>
                        </div>


                        {headers.map((header, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={header.key}
                                    onChange={(event) => updateHeader(index, "key", event.target.value)}
                                    placeholder="Key"
                                    className={`${inputClasses} font-mono w-1/3`}
                                />
                                <input
                                    type="text"
                                    value={header.value}
                                    onChange={(event) => updateHeader(index, "value", event.target.value)}
                                    placeholder="Value"
                                    className={`${inputClasses} font-mono flex-1`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeHeader(index)}
                                    aria-label="Remove header"
                                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-[#F85149] transition-colors rounded"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="requestBody" className="text-sm text-on-surface-variant font-medium">
                                Request Body <span className="opacity-70 font-normal">(Optional)</span>
                            </label>
                            <span className="text-[11px] font-mono text-on-surface-variant px-2 py-0.5 rounded bg-surface-raised">JSON</span>
                        </div>
                        <textarea
                            id="requestBody"
                            rows="5"
                            value={requestBody}
                            onChange={(event) => setRequestBody(event.target.value)}
                            placeholder={'{\n  "key": "value"\n}'}
                            className={`${inputClasses} font-mono text-sm text-primary resize-y`}
                        ></textarea>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <label htmlFor="tags" className="text-sm text-on-surface-variant font-medium">Tags</label>
                        <div className="bg-background border border-surface-border rounded p-2 flex flex-wrap gap-2 items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors min-h-[42px]">
                            {tags.map((tag) => (
                                <span key={tag} className="bg-surface-raised text-on-surface text-xs px-2 py-1 rounded border border-surface-border flex items-center gap-1">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`Remove tag ${tag}`}
                                        className="hover:text-primary transition-colors flex items-center"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </span>
                            ))}
                            <input
                                id="tags"
                                type="text"
                                value={tagInput}
                                onChange={(event) => setTagInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addTag();
                                    }
                                }}
                                onBlur={addTag}
                                placeholder="Add tag..."
                                className="bg-transparent border-none focus:ring-0 text-on-surface p-0 w-24 text-[13px] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={() => navigate("/apis")}
                            className="bg-transparent border border-surface-border text-on-surface text-sm px-5 py-2 rounded font-semibold hover:bg-surface-raised transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-background text-sm px-6 py-2 rounded font-semibold hover:opacity-90 transition-opacity duration-200 shadow-[0_0_12px_rgba(0,217,192,0.2)]"
                        >
                            Save API
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default AddApi;
