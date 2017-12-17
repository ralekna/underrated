module.exports = {
  printHelp() {
    console.log(`
Usage: underrated <command>

Where <command> is one of:
    stats, help, meta  
    
underrated help         print this help
underrated stats        print coin market index
                        -l --limit sets maximum number of top coins to display
underrated pairs        print coin pairs index
                        -l --limit sets maximum number of top coins to display
    `)
  }
};