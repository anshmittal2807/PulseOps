function ApiLogsTable({ logs }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
                <thead>
                    <tr className="text-on-surface-variant border-b border-surface-border bg-background">
                        <th className="py-3 px-4 font-normal">Timestamp</th>
                        <th className="py-3 px-4 font-normal">Status Code</th>
                        <th className="py-3 px-4 font-normal text-right">Response Time</th>
                        <th className="py-3 px-4 font-normal">Error Message</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => {
                        const isError = log.statusCode >= 400 || log.statusCode === 0;
                        const statusText = log.statusCode === 0 ? "—" : String(log.statusCode);
                        return (
                            <tr key={log.id} className="border-b border-surface-border hover:bg-surface-raised transition-colors">
                                <td className="py-2 px-4">{log.timestamp}</td>
                                <td className={`py-2 px-4 ${isError ? "text-error" : "text-primary"}`}>{statusText}</td>
                                <td className="py-2 px-4 text-right">{log.responseTime}</td>
                                <td className={`py-2 px-4 ${isError ? "text-error" : "text-on-surface-variant"}`}>{log.errorMessage || "—"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ApiLogsTable;