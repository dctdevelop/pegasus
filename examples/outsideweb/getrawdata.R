library(httr)

getPegasusRawData <- function(site, auth, query, token=NULL, iters=20, poll_secs=5, jobid=NULL){

  if (is.null(token) )
  {
    response <- POST(paste(site, "/login", sep=""), body = auth, encode = "json")
    token <- content(response)$auth
  }
  if(is.null(jobid) == TRUE){
    print ("rawdata GET")
    flush.console()
    response <- GET(paste(site, "/rawdata?", sep=""), query=query, add_headers(c(Authenticate = token, "X-Time-Zone" = 'America/Bogota')))
    job <- content(response)
    jobid = job$job_id
  }
  if ( is.null(jobid) == TRUE ) {
    print ("got no job")
    flush.console()
    return
  }
  print (c("got job ", jobid))
  
  i=0
  while(i < iters){
    i = i+1
    flush.console()
    Sys.sleep(poll_secs)
    response <- GET(paste(site, "/jobs/", jobid,  sep=""))
    job <- content(response)
    print (paste("waiting job... ", i, job$state, job$progress$step, "/", job$progress$steps, sep=" "))
    if (job$state=="done"){
      print (c("job done", i))
      flush.console()
      response <- GET(paste(site, "/jobs/", jobid, "/data.tsv",  sep=""))
      data <- content(response)
      return(data)
    }
    if (job$state=="stopped"){
      print (c("job stopped", i))
      flush.console()
      break
    }
    if (job$state=="error"){
      print (c("job error", i))
      flush.console()
      break
    }
  }
  
  print (c("timeout ", i ))
  flush.console()
  return 
}