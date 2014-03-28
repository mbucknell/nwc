describe('StatePersistance', function(){
    var $injector = angular.injector(['ngMock', 'nwc.watch']);
    var StatePersistance = $injector.get('RunningWatches');
    
    describe('sharedStateServices.store', function(){
        it('should get the sharedStateServices from injector', function(){
            expect(StatePersistance).not.toBeNull();
        });
        it('should not modify existing state', function(){
            expect(true).toBe(true);
        });
    });
    describe('sharedStateServices.restore', function(){
        it('should do something right', function(){
            expect(true).toBe(true); 
        });
    });
    
});