// main.ts

import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Shot, Hole, Round } from 'golf';

interface CroftGolfSettings {
	includeNegatives: boolean;
	includeDecimals: boolean;
	formatResult: boolean;
}

const DEFAULT_SETTINGS: CroftGolfSettings = {
	includeNegatives: true,
	includeDecimals: true,
	formatResult: true
}

export default class CroftGolfPlugin extends Plugin {
	settings: CroftGolfSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon
		const ribbonIconEl = this.addRibbonIcon('calculator', 'Golf Score', (evt: MouseEvent) => {
			this.calculateScore();
		});
		ribbonIconEl.addClass('croft-golf-ribbon-class');

		// Add command
		this.addCommand({
			id: 'golf-score-in-document',
			name: 'Calculate score in current document',
			callback: () => this.calculateScore(),
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "s" }]
		});

		// Add settings tab
		this.addSettingTab(new CroftGolfSettingTab(this.app, this));
	}

	onunload() {
		// Clean up plugin resources if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

  _appendScoreTable(table: string[], hole: Hole) {
    table[0] = table[0] + " " + hole.getHoleName() + " |";
    table[1] = table[1] + "-----|";
    table[2] = table[2] + " " + hole.getScore() + " |";
    table[3] = table[3] + " " + hole.getPutt() + " |";
    table[4] = table[4] + " " + hole.getPenalty() + " |";
    let gir = hole.isGIR() ? "O" : hole.isGIR1() ? "1" : "X";
    table[5] = table[5] + " " + gir + " |";
    return table;
  }

  _makeScoreTable(table: string[]) {
    let ret = "";
    for (let i = 0; i < table.length; i++) {
      ret = ret + table[i] + "\n";
    }
    return ret;
  }

  getScoreTable(round: Round) {
    let template = ['| Hole |', '|-----|', '| Score |', '| Putt |', '| Penalty |', '| GIR |'];
    let table: string = "";
    let tmp: string[] = [];

    for (let i = 0; i < round.getNumberofHoles(); i++) {
      if (i % 9 == 0) {
        if (tmp.length > 0) {
          table = table + "\n" + this._makeScoreTable(tmp);
        }
        tmp = [...template];
      }
      this._appendScoreTable (tmp, round.getHole(i+1));
    }

    if (tmp.length > 0) {
      table = table + "\n" + this._makeScoreTable(tmp);
    }
    return table;
  }

  getFeelChart(round: Round) {
    let feels = round.getShotFeel();
    let sum = feels[0] + feels[1] + feels[2];
    let data = [feels[0]*100/sum, feels[1]*100/sum, feels[2]*100/sum];
    let chart = "```chart\n  type: pie\n  labels: [A, B, C]\n  series:\n    - data: [";
    chart += data.toString() + "]\n  labelColors: true\n```";
    return chart;
  }

	async calculateScore() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('No active document found. Please open a document first.');
			return;
		}
		
		const editor = activeView.editor;
		const content = editor.getValue();
    const lines = content.split('\n');
		
		const round = new Round(lines);
		
		// Display result
		const holes = round.getNumberofHoles();
    const scores = round.getHoleScores();
		const resultModal = new CroftGolfResultModal(this.app, round.getScore(), holes, scores);
		resultModal.open();

    const file = this.app.workspace.getActiveFile();
    if (file) {
      const content = await this.app.vault.read(file);
      await this.app.vault.modify(file, content + "\n"
            + "Total Score : " + round.getScore() + "\n" 
            + "Average Putt : " + round.getAveragePutt() + "\n" 
            + "GIR Rate : " + round.getGIRRate() + "\n" 
            + "Result & Quality : " + round.compareQnR() + "\n" 
            + this.getScoreTable(round) + "\n" 
            + this.getFeelChart(round) + "\n");
    }
	}
}

class CroftGolfResultModal extends Modal {
	score: number;
  holes: number;
	scores: number[];

	constructor(app: App, score: number, holes: number, scores: number[]) {
		super(app);
		this.score = score;
		this.holes = holes;
		this.scores = scores;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Score Result' });
		
		// Display total count
		contentEl.createEl('p', { text: `${this.holes} holes in the document.` });
		
		// Display the sum
		const resultDiv = contentEl.createDiv();
		resultDiv.addClass('score-sum-result');
		const sumHeading = resultDiv.createEl('h3', { text: 'Total:' });
		const sumValue = resultDiv.createEl('span', { text: this.score});
		sumValue.addClass('score-sum-value');
		
		// Show list of scores 
    const scoresDiv = contentEl.createDiv();
    scoresDiv.addClass('score-sum-list');
    
    const scoresHeading = scoresDiv.createEl('h3', { text: 'scores found:' });
    const scoresList = scoresDiv.createEl('div');
    scoresList.addClass('scores-list');
    
    this.scores.forEach((num, index) => {
      const numEl = scoresList.createEl('span', { text: num.toString() });
      numEl.addClass('number-item');
      
      if (index < this.scores.length - 1) {
        scoresList.createEl('span', { text: ', ' });
      }
    });
  
		// Add copy button
		const buttonDiv = contentEl.createDiv();
		buttonDiv.addClass('score-sum-buttons');
		
		const copyButton = buttonDiv.createEl('button', { text: 'Copy Sum' });
		copyButton.addEventListener('click', () => {
			navigator.clipboard.writeText(this.result);
			new Notice('Total score copied to clipboard!');
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class CroftGolfSettingTab extends PluginSettingTab {
	plugin: CroftGolfPlugin;

	constructor(app: App, plugin: CroftGolfPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Croft Golf Settings' });

		new Setting(containerEl)
			.setName('Include negative scores')
			.setDesc('When enabled, negative scores will be included in the sum')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeNegatives)
				.onChange(async (value) => {
					this.plugin.settings.includeNegatives = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include decimal scores')
			.setDesc('When enabled, decimal scores will be included in the sum')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeDecimals)
				.onChange(async (value) => {
					this.plugin.settings.includeDecimals = value;
					await this.plugin.saveSettings();
				}));
				
		new Setting(containerEl)
			.setName('Format result')
			.setDesc('When enabled, the result will include thousand separators and proper decimal places')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.formatResult)
				.onChange(async (value) => {
					this.plugin.settings.formatResult = value;
					await this.plugin.saveSettings();
				}));
	}
}
