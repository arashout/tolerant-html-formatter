# HTML Formatter
To get it up and running:    
```bash
npm install
tsc --watch    
npm run manual-test
```

To run the "unit" tests (Not really unit tests):    
`npm run test`    

Checklist:
- [x] Discuss attributes max line-length (Attribute max length seperate from normal line limit)
- [x] Discuss indentation on blank lines (Trim these because that is prettier's behavior)
- [ ] Instead of passing rule traces through each node which, create a service that rules can call
- [ ] Create maps of each rule list, so we can call specific rules by name
- [ ] Figuring out how to tackle `pre` tags