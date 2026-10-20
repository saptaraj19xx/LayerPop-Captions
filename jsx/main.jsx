/* LayerPop host functions for Premiere Pro CEP. */
function LP_ping(){
  try {
    return "LAYERPOP_READY";
  } catch (e) {
    return "ERROR:" + String(e).replace(/\n/g, " ");
  }
}

function LP_getSequenceInfo(){
  try {
    if (!app || !app.project) return "NO_PROJECT";
    var s = app.project.activeSequence;
    if (!s) return "NO_ACTIVE_SEQUENCE";
    return "SEQUENCE:" + s.name + "|FRAME_RATE:" + s.frameRate.toString() + "|VIDEO_TRACKS:" + s.videoTracks.numTracks.toString() + "|AUDIO_TRACKS:" + s.audioTracks.numTracks.toString();
  } catch (e) {
    return "ERROR:" + String(e).replace(/\n/g, " ");
  }
}

function LP_insertMogrt(path){
  try {
    if (!path) return "ERROR:NO_MOGRT_PATH";
    if (!app || !app.project) return "ERROR:NO_PROJECT";
    if (!app.project.rootItem) return "ERROR:NO_ROOT_ITEM";

    var file = new File(path);
    if (!file || !file.exists) return "ERROR:MOGRT_NOT_FOUND";

    var imported = app.project.importFiles([file], false, app.project.rootItem, true);
    return imported ? "OK:MOGRT_IMPORT_ATTEMPTED|PATH:" + path : "ERROR:MOGRT_IMPORT_FAILED";
  } catch (e) {
    return "ERROR:" + String(e).replace(/\n/g, " ");
  }
}
