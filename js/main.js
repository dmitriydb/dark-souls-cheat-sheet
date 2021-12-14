(function($) {

    //профили по умолчанию
    var defaultProfiles = {
        'current': 'Default Profile'
    };

    defaultProfiles[profilesKey] = {
        'Default Profile': {
            checklistData: {},
            turnedOff: {}
        }
    }

    var profiles = $.jStorage.get(profilesKey, defaultProfiles);
    jQuery(document).ready(function($) {
      $("body").contextmenu(function(){
          return false;
        });

      $("#check-all").click(function(){

          $(".checkbox").each(function(index, item){
            let id = $(this).find('input').attr('id');
              $(item).find("input").prop('checked', true);
              profiles[profilesKey][profiles.current].checklistData[id] = true;


          });
          calculateTotals();
          $.jStorage.set(profilesKey, profiles);
      });

      $("#uncheck-all").click(function(){

          $(".checkbox").each(function(index, item){

              let id = $(this).find('input').attr('id');
              if (profiles[profilesKey][profiles.current].turnedOff[id]) return;
              $(item).find("input").removeAttr('checked', '');
              profiles[profilesKey][profiles.current].checklistData[id] = false;
          });
          calculateTotals();
          $.jStorage.set(profilesKey, profiles);
      });

        // localStorage.clear();
        // TODO Find a better way to do this in one pass
        $('ul li li').each(function(index) {
            if ($(this).attr('data-id')) {
                addCheckbox(this);
            }
        });

        $('ul li').each(function(index) {
            if ($(this).attr('data-id')) {
                addCheckbox(this);
            }
        });

        populateProfiles();

        //функция обработки нажатия на чекбокс
        $('input[type="checkbox"]').click(function() {
            var id = $(this).attr('id');
            var isChecked = profiles[profilesKey][profiles.current].checklistData[id] = $(this).prop('checked');
            $(this).parent().parent().find('li > label > input[type="checkbox"]').each(function() {
                var id = $(this).attr('id');
                profiles[profilesKey][profiles.current].checklistData[id] = isChecked;
                $(this).prop('checked', isChecked);
            });
            $.jStorage.set(profilesKey, profiles);
            calculateTotals();
        });

        $('#profiles').change(function(event) {
            profiles.current = $(this).val();
            $.jStorage.set(profilesKey, profiles);
            populateChecklists();
        });

        $('#profileAdd').click(function() {
            $('#profileModalTitle').html('Add Profile');
            $('#profileModalName').val('');
            $('#profileModalAdd').show();
            $('#profileModalUpdate').hide();
            $('#profileModalDelete').hide();
            $('#profileModal').modal('show');
        });

        $('#profileEdit').click(function() {
            $('#profileModalTitle').html('Edit Profile');
            $('#profileModalName').val(profiles.current);
            $('#profileModalAdd').hide();
            $('#profileModalUpdate').show();
            if (canDelete()) {
                $('#profileModalDelete').show();
            } else {
                $('#profileModalDelete').hide();
            }
            $('#profileModal').modal('show');
        });

        $('#profileModalAdd').click(function(event) {
            event.preventDefault();
            var profile = $.trim($('#profileModalName').val());
            if (profile.length > 0) {
                if (typeof profiles[profilesKey][profile] == 'undefined') {
                    profiles[profilesKey][profile] = { checklistData: {}, turnedOff: {} };
                }
                profiles.current = profile;
                $.jStorage.set(profilesKey, profiles);
                populateProfiles();
                populateChecklists();
            }
            $('#profileModal').modal('hide');
        });

        $('#profileModalUpdate').click(function(event) {
            event.preventDefault();
            var newName = $.trim($('#profileModalName').val());
            if (newName.length > 0 && newName != profiles.current) {
                profiles[profilesKey][newName] = profiles[profilesKey][profiles.current];
                delete profiles[profilesKey][profiles.current];
                profiles.current = newName;
                $.jStorage.set(profilesKey, profiles);
                populateProfiles();
            }
            $('#profileModal').modal('hide');
        });

        $('#profileModalDelete').click(function(event) {
            event.preventDefault();
            if (!canDelete()) {
                return;
            }
            if (!confirm('Are you sure?')) {
                return;
            }
            delete profiles[profilesKey][profiles.current];
            profiles.current = getFirstProfile();
            $.jStorage.set(profilesKey, profiles);
            populateProfiles();
            populateChecklists();
            $('#profileModal').modal('hide');
        });

        $('#profileModalClose').click(function(event) {
            event.preventDefault();
            $('#profileModal').modal('hide');
        });

        calculateTotals();

    });

    //добавляет в profiles список существующих профилей
    function populateProfiles() {
        $('#profiles').empty();
        $.each(profiles[profilesKey], function(index, value) {
            $('#profiles').append($("<option></option>").attr('value', index).text(index));
        });
        $('#profiles').val(profiles.current);
    }

    function populateChecklists() {
        $('input[type="checkbox"]').prop('checked', false);
        $.each(profiles[profilesKey][profiles.current].checklistData, function(index, value) {
            $('#' + index).prop('checked', value);
        });

        calculateTotals();
    }

    /**Вычисляет количество нажатых чекбоксов в каждой категории
    и общий показатель*/
    function calculateTotals() {
        $('[id$="_overall_total"]').each(function(index) {
            var type = this.id.match(/(.*)_overall_total/)[1];
            var overallCount = 0, overallChecked = 0;
            $('[id^="' + type + '_totals_"]').each(function(index) {
                var regex = new RegExp(type + '_totals_(.*)');
                var i = parseInt(this.id.match(regex)[1]);
                var count = 0, checked = 0;
                for (var j = 1; ; j++) {
                    var checkbox = $('#' + type + '_' + i + '_' + j);
                    if (checkbox.length == 0) {
                        break;
                    }
                    count++;
                    overallCount++;
                    if (checkbox.prop('checked')) {
                        checked++;
                        overallChecked++;
                    }
                }
                if (checked == count) {
                    this.innerHTML = $('#' + type + '_nav_totals_' + i)[0].innerHTML = '[DONE]';
                    $(this).removeClass('in_progress').addClass('done');
                    $($('#' + type + '_nav_totals_' + i)[0]).removeClass('in_progress').addClass('done');
                } else {
                    this.innerHTML = $('#' + type + '_nav_totals_' + i)[0].innerHTML = '[' + checked + '/' + count + ']';
                    $(this).removeClass('done').addClass('in_progress');
                    $($('#' + type + '_nav_totals_' + i)[0]).removeClass('done').addClass('in_progress');
                }
            });
            if (overallChecked == overallCount) {
                this.innerHTML = '[DONE]';
                $(this).removeClass('in_progress').addClass('done');
            } else {
                this.innerHTML = '[' + overallChecked + '/' + overallCount + ']';
                $(this).removeClass('done').addClass('in_progress');
            }
        });
    }

    /* Добавляет чекбокс в элемент с атрибутом data_id
      Если чекбокс в профиле был установлен, то устанавливает его в checked
    */
    function addCheckbox(el) {
        var lines = $(el).html().split('\n');
        lines[0] = '<label class="checkbox"><input type="checkbox" id="' + $(el).attr('data-id') + '">' + lines[0] + '</label>';
        $(el).html(lines.join('\n'));
        if (profiles[profilesKey][profiles.current].checklistData[$(el).attr('data-id')] == true) {
            $('#' + $(el).attr('data-id')).prop('checked', true);
        }
        if (profiles[profilesKey][profiles.current].turnedOff[$(el).attr('data-id')]) {
            $('#' + $(el).attr('data-id')).prop('checked', true);
            $('#' + $(el).attr('data-id')).prop('disabled', true);
            $('#' + $(el).attr('data-id')).parent().css("opacity", "0.3");
        }


$(".checkbox").click(function(){
  let id = $(this).find('input').attr('id');
  if (profiles[profilesKey][profiles.current].turnedOff[id]){
    $(this).find('input').removeAttr('disabled','');
    $(this).find('input').removeAttr("checked", "");
    $(this).find('input').prop("checked", "true");
    this.style = "opacity:1";
    profiles[profilesKey][profiles.current].turnedOff[id] = false;
    calculateTotals();
    $.jStorage.set(profilesKey, profiles);

  }
});

        $(".checkbox").mousedown(function(event){
            if (event.which == 3){
                  let id = $(this).find('input').attr('id');
                  $(this).find('input').prop("checked", "true");
                  $(this).find('input').prop("disabled", "true");
                  this.style = "opacity:0.3";
                  profiles[profilesKey][profiles.current].turnedOff[id] = true;
                  calculateTotals();
                  $.jStorage.set(profilesKey, profiles);
            }
        });
    }

    function canDelete() {
        var count = 0;
        $.each(profiles[profilesKey], function(index, value) {
            count++;
        });
        return (count > 1);
    }

    function getFirstProfile() {
        for (var profile in profiles[profilesKey]) {
            return profile;
        }
    }

})( jQuery );
