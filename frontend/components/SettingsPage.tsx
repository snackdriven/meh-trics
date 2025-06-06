import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCopyEdit } from "../contexts/CopyEditContext";
import { useToast } from "../hooks/useToast";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";

interface SettingsPageProps {
	tabPrefs: Record<string, TabPref>;
	tabOrder: string[];
	onTabsSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

interface SettingsCopy {
	title: string;
}

const defaultCopy: SettingsCopy = {
	title: "Settings",
};

export function SettingsPage({
	tabPrefs,
	tabOrder,
	onTabsSave,
}: SettingsPageProps) {
	const { showSuccess, showError } = useToast();
	const { editAll, setEditAll } = useCopyEdit();
	const [copy, setCopy] = useState<SettingsCopy>(() => {
		const stored = localStorage.getItem("settingsCopy");
		return stored ? JSON.parse(stored) : defaultCopy;
	});
	const [editingCopy, setEditingCopy] = useState(false);
	const [tabsDialogOpen, setTabsDialogOpen] = useState(false);

	const resetAllCopy = () => {
		const keys = [
			"momentCopy",
			"routineCopy",
			"pulseCopy",
			"habitsCopy",
			"calendarCopy",
			"metricsTitle",
			"tasksCopy",
			"settingsCopy",
		];
		for (const k of keys) {
			localStorage.removeItem(k);
		}
		setCopy(defaultCopy);
		showSuccess("Copy reset to defaults");
	};

	const handleCopyChange = (field: keyof SettingsCopy, value: string) => {
		setCopy((prev) => ({ ...prev, [field]: value }));
	};

	const saveCopy = () => {
		localStorage.setItem("settingsCopy", JSON.stringify(copy));
		setEditingCopy(false);
	};

	return (
		<div className="space-y-4 p-4">
			{editingCopy ? (
				<div className="space-y-2">
					<Textarea
						value={copy.title}
						onChange={(e) => handleCopyChange("title", e.target.value)}
						className="text-2xl font-bold"
					/>
					<div className="flex gap-2">
						<Button onClick={saveCopy}>Save</Button>
						<Button variant="outline" onClick={() => setEditingCopy(false)}>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">{copy.title}</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setEditingCopy(true)}
					>
						Edit Copy
					</Button>
				</div>
			)}
			<div>
				<Button variant="outline" onClick={() => setTabsDialogOpen(true)}>
					Edit Tabs
				</Button>
				<EditTabsDialog
					prefs={tabPrefs}
					order={tabOrder}
					open={tabsDialogOpen}
					onOpenChange={setTabsDialogOpen}
					onSave={(p, o) => {
						onTabsSave(p, o);
						setTabsDialogOpen(false);
					}}
				/>
			</div>
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setEditAll(!editAll)}
				>
					{editAll ? "Done Editing Copy" : "Edit Copy Everywhere"}
				</Button>
				<Button variant="destructive" size="sm" onClick={resetAllCopy}>
					Reset All Copy
				</Button>
			</div>
		</div>
	);
}
