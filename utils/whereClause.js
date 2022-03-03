class WhereClause{
    constructor(base,bigQ)
    {
        this.base = base;
        this.bigQ = bigQ;
    }

    search(){
        const searchWord =  this.bigQ.search ? {
            name : { $regex: this.bigQ.search }
        } : {}
        this.base = this.base.find({...searchWord});
        return this;
    }

    //Pagination
    pager(resultperPage)
    {
        let currentPage = 1;
        if(this.bigQ.page){
            currentPage = this.bigQ.page;
        }
        const skipVal = resultperPage * (currentPage-1);

        this.base = this.base.limit(resultperPage).skip(skipVal);

        return this;
    }

    filter(){
        const copyQ = {...this.bigQ};

        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        //Convert copyQ into a string
        
        let stringOfBigQ = JSON.stringify(copyQ);

        stringOfBigQ = stringOfBigQ.replace(/\b(gte|lte|gt|lt)\b/g, m=> `$${m}`)
    
        const jsonOfBigQ = JSON.parse(stringOfBigQ);

        this.base = this.base.find(jsonOfBigQ);
        return this;
    }
};

module.exports = WhereClause;