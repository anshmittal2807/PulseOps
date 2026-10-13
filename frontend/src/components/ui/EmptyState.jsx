import Icon from "./Icon.jsx";
import { useNavigate } from "react-router-dom";

function EmptyState({ icon = "inbox", title, hint, actionLabel, actionTo, onAction }) {
    const navigate = useNavigate();
    const handleAction = () => {
        if (onAction) onAction();
        else if (actionTo) navigate(actionTo);
    };
    return (
        <div className="bg-surface border border-dashed border-surface-border rounded-xl px-6 py-12 text-center">
            <span className="mx-auto mb-3 w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-on-surface-variant">
                <Icon name={icon} className="text-2xl" />
            </span>
            <h3 className="font-headline text-base font-semibold text-on-surface">{title}</h3>
            {hint && <p className="text-sm text-on-surface-variant mt-1 max-w-md mx-auto">{hint}</p>}
            {actionLabel && (
                <button
                    type="button"
                    onClick={handleAction}
                    className="mt-5 h-10 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                    <Icon name="add" className="text-lg" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default EmptyState;
