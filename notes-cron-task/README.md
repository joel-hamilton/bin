# Personal Notes Cron
## What does it do?
1. Emails a 'daily digest', a selection of notes/paragraphs marked for FREQUENT/OCCASIONAL/INFREQUENT review, via box tagging system of [[Box1]], [[Box2]], [[Box3]]. Configured for AWS SES currently.
2. Updates 'Daily Digest.md' file with a new 'daily digest'
3. Calls in-text functions and updates calculated values. In-text functions are defined as `$FN_NAME($PARAM ~ $CALCULATED_VALUE)`. 
    - eg: `...has a son named Zeke age(March 2019)`, which gets expanded to `...has a son named Zeke age(March 2019 ~ 3 years old)`.
    - TODO: accept comma-separated params in the future; no need at present
    - TODO: add reminder function, leverage current box-system to determine which text chunk to send in notification
        - eg: `[[Box3]] remind('every 3 months') ... paragraph/page`
## Usage
- requires ENV variables listed in .env.example
- run with eg: crontab `0 06 * * * /Users/joel/.nvm/versions/node/v12.22.7/bin/node /Users/joel/bin/notes-cron-task/start >> ~/.cron.log`

## TODO
- add different tags to notes content, and format DD better. Eg:
    - Bible verse/passage
    - contact details (trim top out)
    - box1/2/3 review