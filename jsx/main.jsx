/* LayerPop host functions for Premiere Pro CEP. */
function LP_ping(){return "LAYERPOP_READY";}
function LP_getSequenceInfo(){try{if(!app.project||!app.project.activeSequence)return "NO_ACTIVE_SEQUENCE";var s=app.project.activeSequence;return "SEQUENCE:"+s.name+"|VIDEO_TRACKS:"+s.videoTracks.numTracks;}catch(e){return "ERROR:"+e.toString();}}
function LP_insertMogrt(path){try{if(!path)return "ERROR:NO_MOGRT_PATH";if(!app.project||!app.project.activeSequence)return "NO_ACTIVE_SEQUENCE";var s=app.project.activeSequence;if(s.videoTracks.numTracks<1)return "NO_VIDEO_TRACK";var result=s.importMGT(path,0,0,0);return result?"MOGRT_INSERTED":"MOGRT_INSERT_FAILED";}catch(e){return "ERROR:"+e.toString();}}
