angular.module('wc.directives', [], function($compileProvider) {
  $compileProvider.directive('view', function($compile) {
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
           // watch the 'view' expression for changes
          return scope.$eval(attrs.view);
        },
        function(value) {
          // when the 'view' expression changes
          $.ajax({
            url: '/partials/' + value,
            success: function(data) {
              element.html(data);
              $compile(element.contents())(scope);
              scope.$apply();
            }
          });
        }
      );
    };
  });
});
