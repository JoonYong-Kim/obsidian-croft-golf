# Croft Golf Obsidian Plugin

This project is an Obsidian plugin designed to help golfers efficiently record and manage their round data.  
It allows users to systematically log each hole and shot information in a structured and intuitive manner.

## 🚀 Key Features
- **Golf Round Logging**: Easily input and manage shot details within Obsidian notes.
- **Structured Data Format**: A simple and intuitive text-based recording system.
- **Future Expandability**: Planned enhancements for statistics, performance tracking, and analytics.

## 📥 Installation

1. Clone this repository.
   ```sh
   git clone https://github.com/JoonYong-Kim/obsidian-croft-golf.git
   ```
2. Move the files to the Obsidian plugin directory (`.obsidian/plugins/`) and enable the plugin.
3. Compile it.
   ```sh
   npm install
   npm run dev
   ```

## 📝 Data Writing Rule

Each line is managed as either hole information or shot information.
Hole information lines represent hole numbers from 1 to 18, with a maximum of 36 holes possible.
After the hole number, par information is entered as P3, P4, P5, etc.
For example, if the 1st hole is a par 4 hole, it can be entered as 1 P4 or 1P4.
Shot information lines must include an abbreviation for the club used, shot feel, and shot result, and can optionally include additional information such as distance, penalty, or concede.

The structure is approximately as follows:
Club Feel Result \[Landing Spot\] \[Distance\] \[Penalty or Concede\]

Club abbreviations are as follows:

 * D : Driver
 * W3 : Wood 3
 * W5 : Wood 5
 * UW : Utility Wood
 * U3 : Hybrid 3
 * U4 : Hybrid 4
 * U5 : Hybrid 5
 * I3 : Iron 3
 * I4 : Iron 4
 * I5 : Iron 5
 * I6 : Iron 6
 * I7 : Iron 7
 * I8 : Iron 8
 * I9 : Iron 9
 * IP : Iron P
 * 48 : Wedge 48
 * 52 : Wedge 52
 * 56 : Wedge 56
 * P : Putter

Shot feel and shot result are divided into A, B, C grades, with A representing the best result.
Landing Spot would be B which means it landed on bunker.
Distance is recorded in meters, and concede is marked as OK.
Penalty information includes general penalty and out of bounds, marked as H and OB respectively.

### 🎯 Example Input
```
1P4
D B C
I5 A C 150 H
P C A 10 OK
```
#### 📌 Data Format Explanation
- `1P4` → **Hole 1, Par 4**
- `D B C` → **Driver shot, B-grade feel, C-grade result**
- `I5 A C 150 H` → **Iron 5, A-grade feel, C-grade result, 150 meters, Hazard**
- `P C A 10 OK` → **Putter, C-grade feel, A-grade result, 10 meters, Conceded**

## 🛠️ Development & Future Enhancements
- [ ] **Improved User Interface**: A more intuitive UI for inputting and reviewing shot data.
- [ ] **Statistics Features**: Analyze success rates and distances per hole/club.
- [ ] **Automated Insights**: Provide strategic recommendations based on playstyle.

## 🤝 Contributing
If you'd like to contribute, feel free to submit feedback via [Issues](https://github.com/JoonYong-Kim/obsidian-croft-golf/issues).  
Pull requests are also welcome! 🙌

