# Croft Golf Obsidian Plugin

This project aims to collect and manage data about golf as a hobby activity.
During a round, shot information is recorded in a notebook, and after the round, the information is entered and processed.

## Data Rule

Each line is managed as either hole information or shot information.
Hole information lines represent hole numbers from 1 to 18, with a maximum of 36 holes possible.
After the hole number, par information is entered as P3, P4, P5, etc.
For example, if the 1st hole is a par 4 hole, it can be entered as 1 P4 or 1P4.
Shot information lines must include an abbreviation for the club used, shot feel, and shot result, and can optionally include additional information such as distance, penalty, or concede.

The structure is approximately as follows:
Club Feel Result \[Distance\] \[Penalty or Concede\]

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
Distance is recorded in meters, and concede is marked as OK.
Penalty information includes general penalty and out of bounds, marked as H and OB respectively.
Here are three examples:

If you swung a driver with an intermediate shot feel and a poor shot result, record it as:

`D B C`

If you swung a 5-iron for 150 meters with a good shot feel, but the shot result was poor and you received a 1-stroke penalty for a water hazard, record it as:

`I5 A C 150 H`

If you putted 10 meters with a putter, with a poor shot feel but a good result that received a concede, record it as:

`P C A 10 OK`




