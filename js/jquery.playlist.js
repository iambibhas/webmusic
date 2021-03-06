(function($) {
    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), loopstorestate = null;

                // If the plugin hasn't been initialized yet
                if (!data) {
                    $this.data('playlist', {
                        target : $this,
                        store : options.store || this.store(),
                        uniqids : [],
                        randomuniqids : [],
                        prevrandomuniqids : [],
                        currentuniqid : null,
                        current : null, // SoundManager object
                        shuffle : options.shuffle || false,
                        loop : options.loop || false,
                        loadedSID : [],
                        timer: null,
                        slidecreated: false
                    });
                    data = $this.data('playlist');
                    loopstorestate = data.store.store('getLoopState');
                    if (loopstorestate !== null){
                        data.loop = loopstorestate;
                    }
                    if (len(data.store.store('getTracks')) > 0){
                        show_playlist_tab($this);
                    }
                }
                $this.trigger('playlistcreate');
            });
        },
        setPlaylistDiv : function( playlist_div ) {
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), tracks = data.store.store('getTracks'), ind = null;
                data.playlist_div = playlist_div;
                if(len(tracks) > 0){
                    for (ind in tracks){
                        data.uniqids.push(tracks[ind].uniqid);
                    }
                    //Init playlist with store
                    data.playlist_div.playlist_div('add', tracks, data.store.store('_getUniqidHead'));
                    $this.playlist('setCurrent', data.store.store('_getUniqidHead'));
                }
            });
        },
        destroy : function() {
            return this.each(function() {
                var $this = $(this);
                $this.playlist('empty');
                $this.removeData('playlist');
            });
        },
        add : function(track, callback) {
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), tracks = data.store.store('getTracks');
                if (!!track.id){
                    track.uniqid = uniqid('track_');
                    data.uniqids.push(track.uniqid);
                    if (data.shuffle){
                        data.randomuniqids.push(track.uniqid);
                    }
                    data.playlist_div.playlist_div('add', track);
                    // Only one track
                    $this.trigger('playlistadd', track);
                    // TODO store as a plugin
                    data.store.store('add', track, data.loop);
                    if (len(tracks) === 0){ // First track, load it !
                        $this.playlist('setCurrent', track.uniqid, callback);
                    }
                }else{
                    // Multiple tracks
                    var ind = 0, trackslen = len(tracks);
                    for (ind in track){
                        track[ind].uniqid = uniqid('track_');
                        data.uniqids.push(track[ind].uniqid);
                        if (data.shuffle){
                            data.randomuniqids.push(track[ind].uniqid);
                        }
                        data.playlist_div.playlist_div('add', track[ind]);
                        $this.trigger('playlistadd', track[ind]);
                        //TODO Store as a plugin
                        data.store.store('add', track[ind], data.loop);
                        if (trackslen === 0){ // First track, load it !
                            $this.playlist('setCurrent', track[ind].uniqid, callback);
                        }
                        trackslen++;
                    }
                }
            });
        },
        move : function(uniqid, after){
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist');
                $this.trigger('playlistmove', uniqid, after);
                // TODO store as a plugin
                data.store.store('move', uniqid, after);
            });
        },
        remove : function( uniqid ) {
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), tracks = data.store.store('getTracks'), x = null;
                if (len(tracks) === 1) {
                    // proper clean (freeing memory)
                    $this.playlist('empty');
                    if (data.shuffle){
                        data.uniqids = [];
                        data.randomuniqids = [];
                        data.prevrandomuniqids = [];
                    }
                }else{
                    $this.trigger('playlistremove', uniqid);
                    //TODO store as a plugin
                    data.store.store('remove', uniqid);
                    if (data.shuffle){
                        for (x in data.uniqids){
                            if (data.uniqids[x] == uniqid){
                                data.uniqids.splice(x,1);
                                return;
                            }
                        }
                        for (x in data.randomuniqids){
                            if (data.randomuniqids[x] == uniqid){
                                data.randomuniqids.splice(x,1);
                                return;
                            }
                        }
                        for (x in data.prevrandomuniqids){
                            if (data.prevrandomuniqids[x] == uniqid){
                                data.prevrandomuniqids.splice(x,1);
                                return;
                            }
                        }
                    }
                }
            });
        },
        empty : function(){
            return this.each(function() {
                $('#player .duration').text('00:00');
                $('#info span').text('Waiting for a track');
                var ind = null, $this = $(this), data = $this.data('playlist');
                data.playlist_div.playlist_div('empty');
                data.store.store('empty');
                data.currentuniqid = null;
                data.current = null;
                data.uniqids = [];
                data.randomuniqids = [];
                data.prevrandomuniqids = [];
                for (ind in data.loadedSID){
                    soundManager.destroySound(data.loadedSID[ind]);
                }
                data.loadedSID = [];
                $this.trigger('playlistempty');
            });
        },
        fetchCurrent : function(callback){
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), tracks = data.store.store('getTracks');
                if (tracks[data.currentuniqid] !== undefined){
                    if (!!tracks[data.currentuniqid].duration){
                        $('#player .total-time').text(formatDuration(tracks[data.currentuniqid].duration));
                        $("#bar").on("slidecreate", function( event, ui ) {
                            data.slidecreated = true;
                            $('#bar').slider('option', 'max', tracks[data.currentuniqid].duration);
                        });
                        if (data.slidecreated){
                            $('#bar').slider('option', 'max', tracks[data.currentuniqid].duration);
                        }
                    }
                    clearTimeout(data.timer);
                    data.timer = setTimeout(function(){
                        data.current = soundManager.createSound({
                            id: tracks[data.currentuniqid].id,
                            url: tracks[data.currentuniqid].uripath,
                            autoLoad: true,
                            autoPlay: false,
                            whileplaying: function(){
                                // Progress bar
                                $('#bar').slider('value', this.position/1000);
                                $('#player .elapsed-time').text(formatDuration(this.position/1000));
                            },
                            onfinish: function(){
                                $player.player('next');
                            },
                            onload: function(){
                                $('#player .total-time').text(formatDuration(this.duration/1000));
                            },
                            volume: 100
                        });
                        $('#info span')
                            .attr('title', 'Artist: ' + tracks[data.currentuniqid].Album.Artist.name + '\nAlbum: ' + tracks[data.currentuniqid].Album.name + '\nName: ' + tracks[data.currentuniqid].name)
                            .text(tracks[data.currentuniqid].Album.name + ' — ' + tracks[data.currentuniqid].name);
                        data.loadedSID.push(tracks[data.currentuniqid].id);
                        if (typeof callback == 'function'){
                            callback();
                        }
                    }, 200);
                }
            });
        },
        setCurrent : function(currentuniqid, callback) {
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), tracks = data.store.store('getTracks');
                if (tracks[currentuniqid] !== undefined){
                    data.currentuniqid = currentuniqid;
                    data.playlist_div.playlist_div('setCurrent', currentuniqid);
                    $this.playlist('fetchCurrent', callback);
                }else{
                    $.error('jQuery.playlist.setCurrent: Unknown currentuniqid "' + currentuniqid + '".');
                }
            });
        },
        toggleShuffle : function(){
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist'), ind = null;
                data.shuffle = !data.shuffle;
                if (data.shuffle){
                    for (ind in data.uniqids){
                        if (data.uniqids[ind] != data.currentuniqid){
                            data.randomuniqids.push(data.uniqids[ind]);
                        }else{
                            data.prevrandomuniqids.push(data.uniqids[ind]);
                        }
                    }
                }else{
                    data.randomuniqids = [];
                    data.prevrandomuniqids = [];
                }
            });
        },
        toggleLoop : function(){
            return this.each(function() {
                var $this = $(this), data = $this.data('playlist');
                data.loop = !data.loop;
                data.store.store('toggleLoop', true);
            });
        },
        getCurrentTrack : function(){
            var data = this.data('playlist');
            return data.current;
        },
        getInfo : function( s ){
            var data = this.data('playlist'), tracks = data.store.store('getTracks'), params = s.split('.');
            if (params.length === 1){
                return tracks[data.currentuniqid][params[0]];
            }else if (params.length === 2){
                return tracks[data.currentuniqid][params[0]][params[1]];
            }else if (params.length === 3){
                return tracks[data.currentuniqid][params[0]][params[1]][params[2]];
            }else{
                $.error('jQuery.playlist.getInfo: Incorrect parameter "' + s + '".');
                return "?";
            }
        },
        getLoopState : function(){
            var data = this.data('playlist');
            return data.loop;
        },
        getCurrentUniqid : function(){
            var data = this.data('playlist');
            return data.currentuniqid;
        },
        getNextUniqid : function(){
            var data = this.data('playlist'), tracks = data.store.store('getTracks'), randno = 0, uniqid, ind = null;
            if (data.shuffle){
                if (data.loop && data.randomuniqids.length === 0){
                    for (ind in data.uniqids){
                        if (data.uniqids[ind] != data.currentuniqid){
                            data.randomuniqids.push(data.uniqids[ind]);
                        }else{
                            data.prevrandomuniqids.push(data.uniqids[ind]);
                        }
                    }
                }
                randno = Math.floor(Math.random()*data.randomuniqids.length);
                uniqid = data.randomuniqids[randno];
                data.prevrandomuniqids.push(uniqid);
                data.randomuniqids.splice(randno, 1);
                return uniqid;
            }
            if (tracks[data.currentuniqid].next === null) return null;
            return tracks[tracks[data.currentuniqid].next].uniqid;
        },
        getPrevUniqid : function(){
            var data = this.data('playlist'), tracks = data.store.store('getTracks');
            if (data.shuffle){
                data.randomuniqids.push(data.prevrandomuniqids.pop());
                return data.prevrandomuniqids[data.prevrandomuniqids.length-1];
            }
            if (tracks[data.currentuniqid].prev === null) return null;
            return tracks[tracks[data.currentuniqid].prev].uniqid;
        },
        size : function(){
            var data = this.data('playlist'), tracks = data.store.store('getTracks');
            return len(tracks);
        }
    };

    $.fn.playlist = function(method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('jQuery.playlist: Method ' + method + ' does not exist');
        }
    };
})(jQuery);
